import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
} from 'src/workspaces/workspaces.utils';
import { MongoRepository } from 'typeorm';
import { AppEntity } from '../app.types';
import { CacheService } from '../cache/cache.service';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId, withMongoQuery } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WithWorkspaceArgs } from '../workspaces/workspaces.utils';
import { WorkspaceBranchEntity } from './entities/workspace-branch.entity';
import { WorkspaceBranchInput } from './workspace-branches.types';

@Injectable()
export class WorkspaceBranchesService {
  constructor(
    @InjectRepository(WorkspaceBranchEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<WorkspaceBranchEntity>,
    private readonly queueProducers: QueueProducersService,
    private readonly cache: CacheService,
  ) {}

  async getByWorkspaceId(workspaceId: string) {
    return this.repository.find({
      where: {
        workspaceId: mustBeObjectId(workspaceId).toString(),
      },
    });
  }

  async create(args: WithWorkspaceArgs<{ input: WorkspaceBranchInput }>) {
    const { member, input, workspaceId } = withWorkspaceArgs(args);
    const branch = new WorkspaceBranchEntity();

    branch.workspaceId = workspaceId;
    branch.name = input.name;
    branch.hotline = input.hotline;
    branch.location = input.location;
    branch.settings = input.settings || {};

    await this.repository.save(branch);

    this.queueProducers.captureEvent({
      ref: branch._id.toString(),
      workspaceId: workspaceId,
      userId: member?.userId,
      type: EventType.WORKSPACE_BRANCH_NEW,
      actionType: EventDataActionType.CREATE,
      persist: true,
      data: {
        branchId: branch._id,
      },
      relatedEntities: [
        {
          entity: AppEntity.WORKSPACE_BRANCHES,
          id: branch._id.toString(),
          index: true,
        },
      ],
    });

    return branch;
  }

  async get(id: string, select?: (keyof WorkspaceBranchEntity)[]) {
    const data = await this.repository.findOne({
      where: {
        _id: mustBeObjectId(id),
      },
      select,
    });

    if (!data) throw new NotFoundException();
    return data;
  }

  getCacheKey(id: string) {
    return `workspace-branch:${id}`;
  }

  async getWithCache(args: WithWorkspaceArgs<{ _id: string }>) {
    const { workspaceId, _id } = withWorkspaceArgs(args);
    const instance = this.cache.instance({
      instanceKey: `workspace-branches:${workspaceId}`,
      fallback: () => this.get(_id),
    });
    return instance.get(_id);
  }

  async clearCache(args: WithWorkspaceArgs<{ _id: string }>) {
    const { workspaceId, _id } = withWorkspaceArgs(args);
    const instance = this.cache.instance({
      instanceKey: `workspace-branches:${workspaceId}`,
    });
    return instance.clear(_id);
  }

  async update(
    args: WithWorkspaceArgs<{ id: string; input: WorkspaceBranchInput }>,
  ) {
    const { member, id, input } = withWorkspaceArgs(args);
    const branch = await this.get(id);

    if (member) {
      validateWorkspaceAccessable({ member, data: branch });
    }

    branch.name = input.name;
    branch.hotline = input.hotline;
    branch.location = input.location;
    branch.settings = input.settings || {};

    await this.repository.save(branch);
    await this.clearCache({
      _id: branch._id.toString(),
      workspaceId: branch.workspaceId,
    });

    this.queueProducers.captureEvent({
      ref: branch._id.toString(),
      workspaceId: member.workspaceId,
      type: EventType.WORKSPACE_BRANCH_UPDATED,
      actionType: EventDataActionType.UPDATE,
      persist: true,
      data: {
        branchId: branch._id,
      },
      relatedEntities: [
        {
          entity: AppEntity.WORKSPACE_BRANCHES,
          id: branch._id.toString(),
          index: true,
        },
      ],
    });

    return branch;
  }

  async archive(member: WorkspaceMember, id: string) {
    const branch = await this.get(id);
    validateWorkspaceAccessable({ member, data: branch });

    branch.isArchived = true;

    await this.repository.save(branch);
    await this.clearCache({ _id: id, workspaceId: branch.workspaceId });

    this.queueProducers.captureEvent({
      ref: branch._id.toString(),
      workspaceId: member.workspaceId,
      type: EventType.WORKSPACE_BRANCH_ARCHIVED,
      actionType: EventDataActionType.ARCHIVED,
      persist: true,
      data: {
        branchId: branch._id,
      },
      relatedEntities: [
        {
          entity: AppEntity.WORKSPACE_BRANCHES,
          id: branch._id.toString(),
          index: true,
        },
      ],
    });
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['name', 'hotline'],
      }),
    );

    return {
      count: data[1],
      data: data[0],
    };
  }

  async getById(id: string, select?: (keyof WorkspaceBranchEntity)[]) {
    return this.repository.findOne({
      where: {
        _id: mustBeObjectId(id),
      },
      select,
    });
  }

  async getByIds(ids: string[], select?: (keyof WorkspaceBranchEntity)[]) {
    return this.repository.find({
      where: {
        _id: { $in: ids.map(mustBeObjectId) },
      },
      select,
    });
  }
}
