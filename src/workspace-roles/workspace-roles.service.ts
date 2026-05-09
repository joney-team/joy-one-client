import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppEntity } from 'src/app.types';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId, RawObjectId } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { WorkspaceMemberEntity } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspaceSettingsService } from '../workspace-settings/workspace-settings.service';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import {
  WorkspaceRole,
  WorkspaceRoleEntity,
} from './entities/workspace-role.entity';
import {
  WorkspaceDefaultRoleId,
  WorkspacePermission,
  WorkspaceRoleInput,
} from './workspace-roles.types';

@Injectable()
export class WorkspaceRolesService {
  constructor(
    @InjectRepository(WorkspaceRoleEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<WorkspaceRoleEntity>,
    @Inject(forwardRef(() => WorkspacesService))
    private readonly workspaces: WorkspacesService,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly workspaceSettings: WorkspaceSettingsService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async get(args: WithWorkspaceArgs<{ id: string }>) {
    const { id, member } = withWorkspaceArgs(args);
    const role = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });

    if (!role) {
      throw new NotFoundException(AppMessage.WORKSPACE_ROLE_NOT_FOUND, {
        cause: { _id: id },
      });
    }

    if (member) {
      validateWorkspaceAccessable({ data: role, member });
    }

    return role;
  }

  cleanPermissions(permissions: string[]) {
    const allPermissions = Object.values(WorkspacePermission);
    return permissions.reduce((acc, key) => {
      if (allPermissions.includes(key as any)) acc.push(key);
      return acc;
    }, []);
  }

  async create(args: WithWorkspaceArgs<{ input: WorkspaceRoleInput }>) {
    const { member, workspaceId, input } = withWorkspaceArgs(args);
    const role = new WorkspaceRoleEntity();

    role.name = input.name;
    role.description = input.description;
    role.color = input.color;
    role.permissions = this.cleanPermissions(input.permissions);
    role.workspaceId = workspaceId;

    await this.repository.save(role);

    this.queueProducers.captureEvent({
      ref: role._id.toString(),
      type: EventType.WORKSPACE_ROLES_NEW,
      persist: true,
      actionType: EventDataActionType.CREATE,
      userId: member?.userId,
      workspaceId: role.workspaceId,
    });

    return role;
  }

  async update(
    args: WithWorkspaceArgs<{ id: string; input: WorkspaceRoleInput }>,
  ) {
    const { member, input } = withWorkspaceArgs(args);
    const role = await this.get(args);

    role.name = input.name;
    role.description = input.description;
    role.color = input.color;
    role.permissions = this.cleanPermissions(input.permissions);

    await this.repository.save(role);

    this.queueProducers.captureEvent({
      ref: role._id.toString(),
      type: EventType.WORKSPACE_ROLES_UPDATED,
      actionType: EventDataActionType.UPDATE,
      persist: true,
      userId: member?.userId,
      workspaceId: role.workspaceId,
      relatedEntities: [
        {
          entity: AppEntity.WORKSPACE_ROLES,
          id: role._id.toString(),
        },
      ],
    });

    return role;
  }

  async remove(args: WithWorkspaceArgs<{ id: string }>) {
    const { member } = withWorkspaceArgs(args);
    const role = await this.get(args);
    await this.repository.delete(role._id);

    this.queueProducers.captureEvent({
      ref: role._id.toString(),
      type: EventType.WORKSPACE_ROLES_REMOVED,
      actionType: EventDataActionType.ARCHIVED,
      relatedEntities: [
        {
          entity: AppEntity.WORKSPACE_ROLES,
          id: role._id.toString(),
        },
      ],
      persist: true,
      workspaceId: role.workspaceId,
      userId: member?.userId,
    });

    return role;
  }

  async getWorkspaceRoles(args: WithWorkspaceArgs) {
    const { workspaceId } = withWorkspaceArgs(args);
    const workspaceSetting = await this.workspaceSettings.get(workspaceId);
    const dynamicRoles = await this.repository.find({
      where: { workspaceId: mustBeObjectId(workspaceId).toString() },
    });

    const roles: WorkspaceRole[] = [
      {
        _id: WorkspaceDefaultRoleId.OWNER,
        name: WorkspaceDefaultRoleId.OWNER,
        permissions: Object.values(WorkspacePermission),
        isEditable: false,
      },
      {
        _id: WorkspaceDefaultRoleId.ADMIN,
        name: WorkspaceDefaultRoleId.ADMIN,
        permissions: Object.values(WorkspacePermission),
        isEditable: false,
      },
      {
        _id: WorkspaceDefaultRoleId.MEMBER,
        name: WorkspaceDefaultRoleId.MEMBER,
        permissions: workspaceSetting.memberPermissions ?? [],
        color: 'gray',
        isEditable: true,
      },
      ...dynamicRoles.map((dynamicRole) => ({
        _id: dynamicRole._id.toString(),
        name: dynamicRole.name,
        permissions: dynamicRole.permissions,
        color: dynamicRole.color,
        isEditable: true,
      })),
    ];

    return roles;
  }

  async getMemberRoles(
    member: Pick<
      WorkspaceMemberEntity,
      'roleIds' | 'workspaceId' | 'workspaceBranchIds'
    >,
    workspace: Pick<WorkspaceEntity, 'branches'>,
  ) {
    let permissions: WorkspacePermission[] = [];

    const addPermission = (permission: WorkspacePermission) => {
      if (!permissions.includes(permission)) permissions.push(permission);
    };

    const removePermission = (permission: WorkspacePermission) => {
      if (permissions.includes(permission))
        permissions = permissions.filter((p) => p !== permission);
    };

    const list: (Pick<WorkspaceRoleEntity, 'name' | 'color'> & {
      _id: RawObjectId;
    })[] = [];

    // Inspect roles
    if (member.roleIds.length === 0) {
      const settings = await this.workspaces.getSettings(member.workspaceId);
      settings.memberPermissions.forEach((permission) => {
        permissions.push(permission);
      });
    } else {
      await Promise.all(
        member.roleIds.map(async (roleId) => {
          if (
            [
              WorkspaceDefaultRoleId.ADMIN,
              WorkspaceDefaultRoleId.OWNER,
            ].includes(roleId as any)
          ) {
            Object.values(WorkspacePermission).forEach((permission) => {
              addPermission(permission);
            });

            return list.push({
              _id: roleId,
              name: `role_${roleId}`,
              color: 'primary',
            });
          }

          const role: WorkspaceRoleEntity | null = await this.get({
            id: roleId,
            workspaceId: member.workspaceId,
          }).catch(() => null);

          if (!role) return null;

          role.permissions.forEach((permission) => {
            addPermission(permission);
          });

          return list.push({
            _id: roleId,
            name: role.name,
            color: role.color || 'gray',
          });
        }),
      );
    }

    // Restrict workspace branches
    const isHasFullAccess = permissions.includes(
      WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS,
    );
    const isWorkspaceHasBranches = workspace.branches > 1;

    if (!isHasFullAccess && isWorkspaceHasBranches) {
      const isHasAssignedBranches =
        (member.workspaceBranchIds || []).length > 0;
      if (!isHasAssignedBranches) {
        removePermission(WorkspacePermission.LOANS_CREATOR);
      }
    }

    return {
      list: list,
      permissions: [...new Set(permissions)],
    };
  }

  async getMembersMatchPermission(
    workspaceId: RawObjectId,
    ...permissions: WorkspacePermission[]
  ) {
    const roles = await this.getWorkspaceRoles({ workspaceId });

    const availableRoles = roles.filter((role) =>
      permissions.some((p) => role.permissions.includes(p)),
    );

    const settings = await this.workspaceSettings.get(workspaceId);

    const isMemberHasPermission =
      !!settings.memberPermissions &&
      permissions.some((p) => settings.memberPermissions.includes(p));

    const members = await this.workspaceMembers.getAll(workspaceId);

    return members.filter(
      (member) =>
        availableRoles.some((role) =>
          member.roles.some((r) => r._id.toString() === role._id.toString()),
        ) ||
        ((!member.roles ||
          member.roles.some(
            (r) => r._id.toString() === WorkspaceDefaultRoleId.MEMBER,
          )) &&
          isMemberHasPermission) ||
        (member.roleIds || []).includes(WorkspaceDefaultRoleId.ADMIN),
    );
  }
}
