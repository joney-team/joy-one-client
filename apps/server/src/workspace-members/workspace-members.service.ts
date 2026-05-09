import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { CacheService } from '../cache/cache.service';
import { swatches } from '../config/config.constants';
import { DatabaseName } from '../database/database.types';
import {
  mustBeObjectId,
  RawObjectId,
  withMongoQuery,
} from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceBranchesService } from '../workspace-branches/workspace-branches.service';
import { WorkspaceRoleEntity } from '../workspace-roles/entities/workspace-role.entity';
import { WorkspaceRolesService } from '../workspace-roles/workspace-roles.service';
import {
  WorkspaceDefaultRoleId,
  WorkspacePermission,
} from '../workspace-roles/workspace-roles.types';
import { WorkspaceSettingsService } from '../workspace-settings/workspace-settings.service';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import {
  WorkspaceMember,
  WorkspaceMemberEntity,
  WorkspaceMemberPublicInfo,
} from './entities/workspace-member.entity';
import {
  AssignWorkspaceMemberRolesArgs,
  TransferOwnerInput,
  UpdateWorkspaceMemberInput,
  UserMutualWorkspace,
  UserPublicInformation,
  WorkspaceMemberOnlineStatus,
} from './workspace-members.types';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @Inject(forwardRef(() => WorkspacesService))
    private workspaces: WorkspacesService,
    @Inject(forwardRef(() => WorkspaceRolesService))
    private workspaceRoles: WorkspaceRolesService,
    @InjectRepository(WorkspaceMemberEntity, DatabaseName.MONGO)
    public readonly repository: MongoRepository<WorkspaceMemberEntity>,
    @Inject(forwardRef(() => UsersService))
    private readonly users: UsersService,
    @Inject(forwardRef(() => WorkspaceBranchesService))
    private readonly workspaceBranches: WorkspaceBranchesService,
    private readonly workspaceSettings: WorkspaceSettingsService,
    private readonly queueProducers: QueueProducersService,
    private readonly cache: CacheService,
  ) {}

  getRef(workspaceId: string | ObjectId, userId: string | ObjectId) {
    return `${mustBeObjectId(workspaceId).toString()}-${mustBeObjectId(userId).toString()}`;
  }

  async randomColor(ws: WorkspaceEntity) {
    const [_, currentTotalMember] = await this.repository.findAndCount({
      where: { workspaceId: ws._id.toString() },
      take: 1,
    });
    return swatches[currentTotalMember];
  }

  async join(args: {
    workspace: WorkspaceEntity;
    user: UserEntity;
    assignRoleIds?: string[];
    workspaceBranchIds?: string[];
    ignoreEvent?: boolean;
  }) {
    const { workspace, user, assignRoleIds, workspaceBranchIds, ignoreEvent } =
      args;
    const ref = this.getRef(workspace._id, user._id);
    const memberJoined = await this.repository.findOne({ where: { ref } });
    if (memberJoined) return memberJoined;

    const member = new WorkspaceMemberEntity();
    member.ref = ref;
    member.workspaceId = workspace._id.toString();
    member.userId = user._id.toString();
    member.color = await this.randomColor(workspace);
    member.roleIds = assignRoleIds || [];
    member.workspaceBranchIds = workspaceBranchIds || [];

    await this.repository.save(member);

    if (!ignoreEvent) {
      this.queueProducers.captureEvent({
        workspaceId: workspace._id.toString(),
        type: EventType.WORKSPACE_MEMBER_JOINED,
        actionType: EventDataActionType.CREATE,
        ref: member.userId,
        userId: user._id.toString(),
        data: {
          name: member.displayName || user.name,
        },
        relatedEntities: [
          {
            entity: AppEntity.WORKSPACE_MEMBERS,
            id: member._id.toString(),
            index: true,
          },
          { entity: AppEntity.USERS, id: member.userId },
        ],
      });
    }

    return member;
  }

  async update(
    args: WithWorkspaceArgs<{
      memberId: string;
      input: UpdateWorkspaceMemberInput;
    }>,
  ) {
    const { member, input, memberId } = withWorkspaceArgs(args);

    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(memberId) },
    });

    if (!data) {
      throw new NotFoundException(AppMessage.WORKSPACE_MEMBER_NOT_FOUND);
    }

    const isSelfUpdate = member && member.userId.toString() === data.userId;
    const isHasEditPermission =
      member &&
      member.permissions.includes(
        WorkspacePermission.WORKSPACE_MEMBERS_MANAGER,
      );

    if (!isSelfUpdate && !isHasEditPermission) {
      throw new ForbiddenException(AppMessage.ACCESS_DENIED);
    }

    data.displayName = input.displayName ?? null;
    data.color = input.color ?? null;
    data.workingTimeType = input.workingTimeType ?? null;
    data.workspaceBranchIds = [...new Set(input.workspaceBranchIds ?? [])];

    await this.repository.save(data);
    await this.syncFromMember(data);

    this.queueProducers.captureEvent({
      type: EventType.WORKSPACE_MEMBER_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: data.workspaceId,
      userId: member.userId,
      ref: data.userId,
      persist: true,
      relatedEntities: [
        {
          entity: AppEntity.WORKSPACE_MEMBERS,
          id: data._id.toString(),
          index: true,
        },
        { entity: AppEntity.USERS, id: member.userId },
      ],
    });

    return data;
  }

  async assignRoles(args: WithWorkspaceArgs<AssignWorkspaceMemberRolesArgs>) {
    const { member, memberId } = withWorkspaceArgs(args);
    const memberData = await this.repository.findOne({
      where: { _id: mustBeObjectId(memberId) },
    });

    if (!memberData) {
      throw new NotFoundException(AppMessage.WORKSPACE_MEMBER_NOT_FOUND);
    }

    const isOwner = memberData.roleIds.includes(WorkspaceDefaultRoleId.OWNER);

    memberData.roleIds = isOwner
      ? [WorkspaceDefaultRoleId.OWNER]
      : [...new Set(args.roleIds ?? [])];

    await this.repository.save(memberData);
    await this.syncFromMember(memberData);

    this.queueProducers.captureEvent({
      type: EventType.WORKSPACE_MEMBER_ASSIGN_ROLES,
      actionType: EventDataActionType.UPDATE,
      workspaceId: memberData.workspaceId,
      userId: member.userId,
      ref: memberData.userId,
      persist: true,
      relatedEntities: [
        {
          entity: AppEntity.WORKSPACE_MEMBERS,
          id: memberData._id.toString(),
          index: true,
        },
        { entity: AppEntity.USERS, id: member.userId },
      ],
    });

    return memberData;
  }

  async joinWithInviteCode(user: UserEntity, inviteCode: string) {
    const workspace = await this.workspaces.getByInviteCode(inviteCode);
    return this.join({
      workspace,
      user,
    });
  }

  async remove(args: WithWorkspaceArgs<{ memberId: string }>) {
    const { memberId, workspaceId } = withWorkspaceArgs(args);

    const member = await this.repository.findOne({
      where: {
        _id: mustBeObjectId(memberId),
        workspaceId: mustBeObjectId(workspaceId).toString(),
      },
    });

    if (!member) {
      throw new NotFoundException(AppMessage.WORKSPACE_MEMBER_NOT_FOUND);
    }

    await this.repository.delete(member._id);

    this.queueProducers.captureEvent({
      ref: member.userId,
      workspaceId: member.workspaceId,
      type: EventType.WORKSPACE_MEMBER_LEAVED,
      actionType: EventDataActionType.ARCHIVED,
      userId: member.userId,
      relatedEntities: [
        {
          entity: AppEntity.WORKSPACE_MEMBERS,
          id: member._id.toString(),
          index: true,
        },
        { entity: AppEntity.USERS, id: member.userId },
      ],
    });

    return member;
  }

  async getUserWorkspaceIds(userId: string) {
    const members = await this.repository.find({
      where: { userId },
      select: ['workspaceId'],
    });

    return members.map((member) => member.workspaceId);
  }

  async getAllByUserId(userId: any) {
    const members = await this.repository.find({
      where: { userId },
      select: ['userId', 'workspaceId'],
    });

    return Promise.all(members.map((member) => this.get(member)));
  }

  async getTotalMembers(workspaceId: any) {
    const result = await this.repository.findAndCount({
      where: {
        workspaceId: mustBeObjectId(workspaceId).toString(),
      },
      select: ['_id'],
    });

    return result[1];
  }

  async getAll(workspaceId: any, branchId?: string) {
    const members = await this.repository.find({
      where: {
        workspaceId: mustBeObjectId(workspaceId).toString(),
        ...(branchId ? { workspaceBranchIds: { $in: [branchId] } } : {}),
      },
    });

    return Promise.all(members.map((member) => this.get(member)));
  }

  async getByMemberId(id: string) {
    const member = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
      select: ['userId', 'workspaceId'],
    });
    if (!member)
      throw new NotFoundException(AppMessage.WORKSPACE_MEMBER_NOT_FOUND);
    return this.get({ userId: member.userId, workspaceId: member.workspaceId });
  }

  async getByUserId(workspaceId: any, userId: any) {
    const member = await this.repository.findOne({
      where: {
        workspaceId: mustBeObjectId(workspaceId).toString(),
        userId: mustBeObjectId(userId).toString(),
      },
    });

    if (!member) {
      throw new NotFoundException(AppMessage.WORKSPACE_MEMBER_NOT_FOUND);
    }

    return member;
  }

  async getByPermission(
    workspaceId: RawObjectId,
    permission: WorkspacePermission,
  ) {
    const allRoles = await this.workspaceRoles.getWorkspaceRoles({
      workspaceId,
    });
    const relatedRoles = allRoles.filter((role) =>
      role.permissions.includes(permission),
    );

    const roleIds = [
      WorkspaceDefaultRoleId.ADMIN,
      WorkspaceDefaultRoleId.OWNER,
      ...relatedRoles.map((role) => role._id.toString()),
    ];

    const members = await this.repository.find({
      where: {
        workspaceId: mustBeObjectId(workspaceId).toString(),
        roleIds: { $in: roleIds },
      },
      select: ['userId', 'workspaceId'],
    });

    return Promise.all(members.map(async (member) => this.get(member)));
  }

  async getByPermissions(
    workspaceId: string,
    ...permissions: WorkspacePermission[]
  ) {
    const roles = await this.workspaceRoles.getWorkspaceRoles({
      workspaceId,
    });
    const availableRoles = roles.filter((role) =>
      permissions.some((p) => role.permissions.includes(p)),
    );
    const settings = await this.workspaceSettings.get(workspaceId);
    const isMemberHasPermission =
      !!settings.memberPermissions &&
      permissions.some((p) => settings.memberPermissions.includes(p));

    const members = await this.getAll(workspaceId);

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

  async getByRole(args: WithWorkspaceArgs<{ roleId: string }>) {
    const { roleId, member } = withWorkspaceArgs(args);
    const dataMembers = await this.repository.find({
      where: {
        roleIds: { $in: [roleId] },
      },
    });

    if (member) {
      dataMembers.map((data) => validateWorkspaceAccessable({ data, member }));
    }

    return dataMembers;
  }

  async getAdmins(workspaceId: any) {
    const members = await this.repository.find({
      where: {
        workspaceId: mustBeObjectId(workspaceId).toString(),
        roleIds: {
          $in: [WorkspaceDefaultRoleId.ADMIN, WorkspaceDefaultRoleId.OWNER],
        },
      },
      select: ['userId', 'workspaceId'],
    });
    return Promise.all(members.map((member) => this.get(member)));
  }

  async transferOwner(
    worspace: WorkspaceEntity,
    member: WorkspaceMember,
    input: TransferOwnerInput,
  ) {
    const currentOwner = await this.repository.findOne({
      where: {
        workspaceId: mustBeObjectId(worspace._id).toString(),
        userId: member.userId.toString(),
      },
    });

    const newOwner = await this.repository.findOne({
      where: {
        workspaceId: mustBeObjectId(worspace._id).toString(),
        userId: mustBeObjectId(input.userId).toString(),
      },
    });

    if (!newOwner)
      throw new NotFoundException(AppMessage.WORKSPACE_MEMBER_NOT_FOUND);

    if (
      !member.roles ||
      !member.roles.some(
        (v) => v._id.toString() === WorkspaceDefaultRoleId.OWNER,
      )
    ) {
      throw new ForbiddenException(AppMessage.WORKSPACE_MEMBER_NOT_OWNER);
    }

    currentOwner.roleIds = [WorkspaceDefaultRoleId.ADMIN];
    newOwner.roleIds = [WorkspaceDefaultRoleId.OWNER];

    await this.repository.save(member);
    await this.repository.save(newOwner);

    await this.syncFromMember(currentOwner);
    await this.syncFromMember(newOwner);

    this.queueProducers.captureEvent({
      workspaceId: worspace._id.toString(),
      userId: member.userId.toString(),
      type: EventType.WORKSPACE_MEMBER_TRANSFER_OWNER,
      actionType: EventDataActionType.UPDATE,
      persist: true,
      ref: newOwner.userId,
      relatedEntities: [
        {
          entity: AppEntity.WORKSPACE_MEMBERS,
          id: newOwner._id.toString(),
          index: true,
        },
        {
          entity: AppEntity.WORKSPACE_MEMBERS,
          id: member._id?.toString(),
          index: true,
        },
      ],
    });

    this.queueProducers.captureEvent({
      workspaceId: worspace._id.toString(),
      userId: member.userId.toString(),
      type: EventType.WORKSPACE_MEMBER_UPDATED,
      actionType: EventDataActionType.UPDATE,
      ref: newOwner.userId,
    });

    this.queueProducers.captureEvent({
      workspaceId: worspace._id.toString(),
      userId: member.userId,
      type: EventType.WORKSPACE_MEMBER_UPDATED,
      actionType: EventDataActionType.UPDATE,
      ref: member.userId,
    });

    return newOwner;
  }

  async getUserPublicInformation(
    userId: string,
    userViewer?: UserEntity,
  ): Promise<UserPublicInformation> {
    const user = await this.users.get(userId);

    let information: UserPublicInformation = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      birthday: user.birthday,
      phone: user.phone,
      color: user.color,
      mutualWorkspaces: [],
      providers: user.providers || [],
      lastSignInAt: user.lastSignInAt,
    };

    if (userViewer) {
      const [userMemberWorkspaces, viewerMemberWorkspaces] = await Promise.all([
        this.repository.find({
          where: {
            userId: user._id.toString(),
          },
        }),
        this.repository.find({
          where: {
            userId: userViewer._id.toString(),
          },
        }),
      ]);

      const mutualWorkspaceMembers = userMemberWorkspaces.filter((v) =>
        viewerMemberWorkspaces.some((m) => m.workspaceId === v.workspaceId),
      );

      const mutualWorkspaces = await Promise.all(
        mutualWorkspaceMembers.map(async (member) => {
          const workspace = await this.workspaces
            .get(member.workspaceId)
            .catch(() => null);

          if (workspace) {
            const roles = await this.workspaceRoles.getMemberRoles(
              member,
              workspace,
            );
            const data: UserMutualWorkspace = {
              _id: workspace._id.toString(),
              name: workspace.name,
              roles: roles.list.map((v) => ({
                _id: v._id.toString(),
                name: v.name,
                color: v.color,
                permissions: [],
                isEditable: false,
              })),
              type: workspace.type,
              displayName: member.displayName,
              logo: workspace.logo,
              color: workspace.color,
              memberColor: member.color,
              memberId: member._id.toString(),
            };

            return data;
          }

          return null;
        }),
      );

      information.mutualWorkspaces = mutualWorkspaces.filter((v) => v !== null);
    }

    return information;
  }

  async get(args: {
    userId: string;
    workspaceId: string;
  }): Promise<WorkspaceMember> {
    const { userId, workspaceId } = args;

    const [user, member, workspace] = await Promise.all([
      this.users.get(userId),
      this.repository.findOne({ where: { userId, workspaceId } }),
      this.workspaces.get(workspaceId),
    ]);

    const [roles, workspaceBranches] = await Promise.all([
      member
        ? this.workspaceRoles.getMemberRoles(member, workspace)
        : {
            list: [] as Pick<WorkspaceRoleEntity, '_id' | 'name' | 'color'>[],
            permissions: [],
          },
      member
        ? this.workspaceBranches.getByIds(member.workspaceBranchIds || [], [
            '_id',
            'name',
          ])
        : ([] as WorkspaceBranchEntity[]),
    ]);

    return {
      _id: member?._id.toString(),
      userId: user._id.toString(),
      memberId: member?._id.toString(),
      memberDisplayName: member?.displayName,
      userDisplayName: user.name,
      name: member?.displayName || user.name,
      avatar: user.avatar,
      phone: user.phone,
      email: user.email,
      color: member?.color || user.color,
      workingTimeType: member?.workingTimeType,
      lastSignInAt: user.lastSignInAt,
      roleIds: roles.list.map((v) => v._id.toString()),
      roles: roles.list,
      joinedAt: member?.createdAt,
      workspaceBranchIds: workspaceBranches.map((v) => v._id.toString()),
      workspaceBranches,
      workspaceId,
      workspace,
      permissions: roles.permissions,
      isJoined: !!member,
      locale: user.locale,
      timezone: user.settings?.timezoneId,
      userRole: user.role,
    };
  }

  async getMemberInfo(args: {
    userId: string;
    workspaceId: string;
  }): Promise<WorkspaceMemberPublicInfo> {
    const instance = this.cache.instance({
      instanceKey: `workspace-members:${args.workspaceId}`,
      fallback: async () => {
        const member = await this.get(args);

        const isFullPermissions =
          member.roleIds.includes(WorkspaceDefaultRoleId.OWNER) ||
          member.roleIds.includes(WorkspaceDefaultRoleId.ADMIN);

        const info: WorkspaceMemberPublicInfo = {
          _id: member._id?.toString() ?? '',
          name: member.name,
          memberId: member.memberId,
          workspaceId: member.workspaceId,
          workspace: member.workspace,
          workspaceBranches: member.workspaceBranches.map((branch) => ({
            _id: branch._id.toString(),
            name: branch.name,
            hotline: branch.hotline,
          })),
          memberDisplayName: member.memberDisplayName,
          userDisplayName: member.userDisplayName,
          avatar: member.avatar,
          phone: member.phone,
          email: member.email,
          color: member.color,
          roleIds: member.roleIds,
          roles: member.roles.map((role) => ({
            _id: role._id.toString(),
            name: role.name,
            color: role.color,
          })),
          permissions: isFullPermissions ? ['*'] : member.permissions,
          userId: member.userId,
          workingTimeType: member.workingTimeType,
          joinedAt: member.joinedAt,
        };

        return info;
      },
    });

    return instance.get(args.userId.toString());
  }

  async getMemberInfos(args: { userId: string }) {
    const members = await this.repository.find({
      where: { userId: args.userId },
      select: ['workspaceId'],
    });
    return Promise.all(
      members.map((member) =>
        this.getMemberInfo({
          userId: args.userId,
          workspaceId: member.workspaceId,
        }),
      ),
    );
  }

  async getMemberInfosByIds(args: { ids: string[]; workspaceId: string }) {
    return Promise.all(
      args.ids.map((id) =>
        this.getMemberInfo({ userId: id, workspaceId: args.workspaceId }),
      ),
    );
  }

  async getMember(args: {
    userId: string;
    workspaceId: string;
  }): Promise<WorkspaceMemberEntity> {
    return this.repository.findOne({
      where: { userId: args.userId, workspaceId: args.workspaceId },
    });
  }

  async getByUserIds(userIds: string[], workspaceId: string) {
    if (!userIds || userIds.length === 0) return [];
    return Promise.all(
      userIds.map(async (userId) => this.get({ userId, workspaceId })),
    );
  }

  async getInfoByUserIds(args: { userIds: string[]; workspaceId: string }) {
    if (!args.userIds || args.userIds.length === 0) return [];
    return Promise.all(
      args.userIds.map(async (userId) =>
        this.getMemberInfo({ userId, workspaceId: args.workspaceId }),
      ),
    );
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const { workspaceId, member, query } = withWorkspaceArgs(args);
    let where = {};
    let order = {};

    if (
      member &&
      member.workspace.branches > 0 &&
      !member.permissions.includes(
        WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS,
      )
    ) {
      const availableBranchIds = member.workspaceBranches.map((branch) =>
        branch._id.toString(),
      );
      const availableFilterBranchIds = args.query?.workspaceBranchIds
        ? args.query.workspaceBranchIds
            .toString()
            .split(',')
            .filter((v: string) => availableBranchIds.includes(v))
        : [];

      if (availableFilterBranchIds.length > 0) {
        where['workspaceBranchIds'] = { $in: availableFilterBranchIds };
      } else {
        where['workspaceBranchIds'] = {
          $in: member.workspaceBranches.map((branch) => branch._id.toString()),
        };
      }
    } else if (args.query?.workspaceBranchIds) {
      where['workspaceBranchIds'] = {
        $in: args.query.workspaceBranchIds.toString().split(','),
      };
    }

    if (query && query.ignoreSelf && member && member.memberId && !query.ids) {
      where['_id'] = { $ne: mustBeObjectId(member.memberId) };
    }

    if (query && query.sortJoinedAt) {
      order['createdAt'] = +query.sortJoinedAt;
    }

    const data = await this.repository.findAndCount(
      withMongoQuery({
        workspaceId,
        query: args.query,
        order,
        where,
        filterFields: ['userId'],
        select: ['userId'],
      }),
    );

    return {
      count: data[1],
      data: await Promise.all(
        data[0].map(async (item) =>
          this.getMemberInfo({ userId: item.userId, workspaceId }),
        ),
      ),
    };
  }

  async onlineStatus(
    workspaceId: string,
  ): Promise<WorkspaceMemberOnlineStatus[]> {
    const members = await this.repository.find({
      where: { workspaceId },
      select: ['userId', '_id'],
    });

    return members
      .map((member) => ({
        userId: member.userId,
        isOnline: this.users.getIsOnline(member.userId),
      }))
      .filter((v) => v.isOnline);
  }

  async syncWorkspace(workspaceId: string) {
    const members = await this.repository.find({
      where: { workspaceId },
      select: ['userId', '_id'],
    });

    const instance = this.cache.instance({
      instanceKey: `workspace-members:${workspaceId}`,
    });

    await instance.clearAll();

    members.forEach((member) => {
      this.queueProducers.searchIndex({
        entity: AppEntity.WORKSPACE_MEMBERS,
        id: member._id.toString(),
      });

      this.queueProducers.captureEvent({
        type: EventType.WORKSPACE_MEMBER_SYNCED,
        actionType: EventDataActionType.UPDATE,
        workspaceId,
        ref: member.userId,
      });
    });
  }

  async syncFromMember(
    member: Pick<WorkspaceMemberEntity, 'userId' | 'workspaceId' | '_id'>,
  ) {
    const instance = this.cache.instance({
      instanceKey: `workspace-members:${member.workspaceId}`,
    });
    await instance.clear(member.userId);
    await this.queueProducers.searchIndex({
      entity: AppEntity.WORKSPACE_MEMBERS,
      id: member._id.toString(),
    });

    await this.queueProducers.captureEvent({
      type: EventType.WORKSPACE_MEMBER_SYNCED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: member.workspaceId,
      ref: member.userId,
    });
  }

  async syncFromUser(userId: string) {
    const members = await this.repository.find({
      where: { userId },
      select: ['userId', '_id', 'workspaceId'],
    });

    await Promise.all(
      members.map(async (member) => this.syncFromMember(member)),
    );
  }
}
