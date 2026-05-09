import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { validateWorkspaceAccessable } from 'src/workspaces/workspaces.utils';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { configs } from '../config/config';
import { DatabaseName } from '../database/database.types';
import {
  bindData,
  mustBeObjectId,
  withMongoQuery,
} from '../database/database.utils';
import {
  EventDataActionType,
  EventType,
  EventVariant,
} from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { UsersService } from '../users/users.service';
import { cryptoDecrypt, cryptoEncrypt } from '../utils/crypto.util';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WithWorkspaceArgs } from '../workspaces/workspaces.utils';
import { WorkspaceApiAppInput } from './workspace-api-apps.dtos';
import { WorkspaceApiAppEntity } from './entities/workspace-api-app.entity';

@Injectable()
export class WorkspaceApiAppsService {
  constructor(
    @InjectRepository(WorkspaceApiAppEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<WorkspaceApiAppEntity>,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private readonly workspaceMembers: WorkspaceMembersService,
    @Inject(forwardRef(() => UsersService))
    private readonly users: UsersService,
    @Inject(forwardRef(() => WorkspacesService))
    private readonly workspaces: WorkspacesService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async bindData(app: WorkspaceApiAppEntity): Promise<WorkspaceApiAppEntity> {
    return bindData<{ member: WorkspaceMember }, WorkspaceApiAppEntity>({
      entity: app,
      extends: {
        member: async (data) =>
          this.workspaceMembers.get({
            userId: data.userId,
            workspaceId: data.workspaceId,
          }),
      },
    });
  }

  async create(member: WorkspaceMember, input: WorkspaceApiAppInput) {
    const appEmail =
      `app-${new ObjectId().toString()}@${member.workspace.code}.co`.toLowerCase();

    // Create user
    const appUser = await this.users.createUserApp({
      name: input.name,
      email: appEmail,
    });

    // Create member
    const appMember = await this.workspaceMembers.join({
      workspace: member.workspace,
      user: appUser,
      assignRoleIds: input.roleIds,
      workspaceBranchIds: input.workspaceBranchIds || [],
      ignoreEvent: true,
    });

    const app = new WorkspaceApiAppEntity();
    app._id = new ObjectId();
    app.memberId = appMember._id.toString();
    app.userId = appUser._id.toString();
    app.workspaceId = member.workspace._id.toString();
    app.authVersion = 1;
    app.enabled = input.enabled;
    app.secretKey = this.getSecretKey(app._id.toString(), app.authVersion);
    await this.repository.save(app);

    this.queueProducers.captureEvent({
      ref: app._id.toString(),
      workspaceId: member.workspace._id.toString(),
      type: EventType.WORKSPACE_API_APP_CREATED,
      actionType: EventDataActionType.CREATE,
      userId: member.userId,
      persist: true,
    });

    return app;
  }

  async get(id: string, member?: WorkspaceMember) {
    const app = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!app) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ member, data: app });
    return app;
  }

  async update(args: {
    member: WorkspaceMember;
    id: string;
    dto: WorkspaceApiAppInput;
  }) {
    const { member, id, dto } = args;
    const app = await this.get(id, member);

    // Update member
    await this.workspaceMembers.repository.update(
      mustBeObjectId(app.memberId),
      {
        roleIds: dto.roleIds,
        workspaceBranchIds: dto.workspaceBranchIds || [],
      },
    );

    // Update user
    await this.users.repository.update(mustBeObjectId(app.userId), {
      name: dto.name,
    });

    app.enabled = dto.enabled;
    await this.repository.save(app);

    this.queueProducers.captureEvent({
      ref: app._id.toString(),
      workspaceId: member.workspace._id.toString(),
      type: EventType.WORKSPACE_API_APP_UPDATED,
      actionType: EventDataActionType.UPDATE,
      userId: member.userId,
      persist: true,
    });

    return app;
  }

  async archive(args: { member: WorkspaceMember; id: string }) {
    const { member, id } = args;
    const app = await this.get(id, member);
    app.enabled = false;
    app.isArchived = true;

    await this.repository.save(app);
    await this.workspaceMembers.remove({
      workspaceId: app.workspaceId,
      memberId: app.memberId,
    });

    this.queueProducers.captureEvent({
      ref: app._id.toString(),
      workspaceId: member.workspace._id.toString(),
      type: EventType.WORKSPACE_API_APP_ARCHIVED,
      userId: member.userId,
      actionType: EventDataActionType.UPDATE,
      variant: EventVariant.NEGATIVE,
      persist: true,
    });

    return app;
  }

  async list(
    args: WithWorkspaceArgs<{
      query?: any;
      select?: (keyof WorkspaceApiAppEntity)[];
    }>,
  ) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['memberId', 'userId', 'enabled'],
        select: args.select,
      }),
    );

    return {
      count: data[1],
      data: data[0],
    };
  }

  async verifyKey(secretKey: string) {
    const decrypted = cryptoDecrypt(
      secretKey.replace('app_', ''),
      configs.ENCRYPT_PASSWORD,
    );

    if (!decrypted) throw new ForbiddenException(AppMessage.ACCESS_DENIED);

    const { id, authVersion } = decrypted;
    const app = await this.get(id);

    if (app.authVersion !== authVersion || !app.enabled || app.isArchived) {
      throw new ForbiddenException(AppMessage.ACCESS_DENIED);
    }

    const workspaceApp = await this.bindData(app);
    const [workspace, user, member] = await Promise.all([
      this.workspaces.get(workspaceApp.workspaceId),
      this.users.get(workspaceApp.userId),
      this.workspaceMembers.get({
        userId: workspaceApp.userId,
        workspaceId: workspaceApp.workspaceId,
      }),
    ]);

    return {
      workspaceApp,
      user,
      member,
      workspace,
    };
  }

  getSecretKey(id: string, authVersion: number) {
    return `app_${cryptoEncrypt({ id, authVersion }, configs.ENCRYPT_PASSWORD)}`;
  }

  async resetSecretKey(args: { id: string; member?: WorkspaceMember }) {
    const { id, member } = args;
    const app = await this.get(id, member);
    app.authVersion++;
    app.secretKey = this.getSecretKey(app._id.toString(), app.authVersion);

    if (member) {
      validateWorkspaceAccessable({ data: app, member });
    }

    await this.repository.save(app);
    return app;
  }
}
