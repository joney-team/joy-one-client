import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { CacheService } from '../cache/cache.service';
import { DatabaseName } from '../database/database.types';
import {
  mustBeObjectId,
  RawObjectId,
  withMongoQuery,
} from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { PartnerEntity } from './partners.entity';
import { PartnerInput } from './partners.types';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(PartnerEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<PartnerEntity>,
    private readonly queueProducers: QueueProducersService,
    private readonly redis: CacheService,
  ) {}

  async getWithCache(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const instance = this.redis.instance({
      instanceKey: 'partners',
      fallback: async () => {
        const data = await this.get(args);
        return data;
      },
    });

    return instance.get(mustBeObjectId(args.id).toString());
  }

  async clearCache(id: RawObjectId) {
    const instance = this.redis.instance({
      instanceKey: 'partners',
    });

    await instance.clear(mustBeObjectId(id).toString());
  }

  async create(
    member: WorkspaceMember,
    ws: WorkspaceEntity,
    dto: PartnerInput,
  ) {
    const partner = new PartnerEntity();
    partner.name = dto.name;
    partner.phone = dto.phone;
    partner.email = dto.email?.toLowerCase().trim();
    partner.logo = dto.logo;
    partner.workspaceId = ws._id.toString();

    await this.repository.save(partner);

    this.queueProducers.captureEvent({
      actionType: EventDataActionType.CREATE,
      type: EventType.PARTNER_NEW,
      ref: partner._id.toString(),
      workspaceId: ws._id.toString(),
      userId: member.userId,
      relatedEntities: [
        { entity: AppEntity.PARTNERS, id: partner._id.toString(), index: true },
      ],
    });

    return partner;
  }

  async get(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { id, member } = withWorkspaceArgs(args);
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });

    if (!data) {
      throw new NotFoundException(AppMessage.WORKSPACE_PARTNER_NOT_FOUND);
    }

    if (member) {
      validateWorkspaceAccessable({ member, data });
    }

    return data;
  }

  async getWithCacheFromIds(args: WithWorkspaceArgs<{ ids: RawObjectId[] }>) {
    const { ids } = withWorkspaceArgs(args);
    return Promise.all(
      ids.map(async (id) => this.getWithCache({ ...args, id })),
    );
  }

  async getByIds(ids: string[]) {
    return this.repository.find({
      where: {
        _id: { $in: ids.map(mustBeObjectId) },
      },
    });
  }

  async update(
    args: WithWorkspaceArgs<{ id: RawObjectId; input: PartnerInput }>,
  ) {
    const { input, member, workspaceId } = withWorkspaceArgs(args);
    const partner = await this.get(args);
    partner.name = input.name;
    partner.phone = input.phone;
    partner.email = input.email?.toLowerCase().trim();
    partner.logo = input.logo;

    await this.repository.save(partner);
    await this.clearCache(partner._id);

    this.queueProducers.captureEvent({
      type: EventType.PARTNER_UPDATED,
      actionType: EventDataActionType.UPDATE,
      ref: partner._id.toString(),
      workspaceId,
      userId: member?.userId,
      relatedEntities: [
        { entity: AppEntity.PARTNERS, id: partner._id.toString(), index: true },
      ],
    });

    return partner;
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['name', 'phone', 'email'],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async archive(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { member, workspaceId } = withWorkspaceArgs(args);
    const partner = await this.get(args);
    partner.isArchived = true;

    await this.repository.save(partner);
    await this.clearCache(partner._id);

    this.queueProducers.captureEvent({
      type: EventType.PARTNER_ARCHIVED,
      actionType: EventDataActionType.ARCHIVED,
      ref: partner._id.toString(),
      workspaceId,
      userId: member?.userId,
      relatedEntities: [
        {
          entity: AppEntity.PARTNERS,
          id: partner._id.toString(),
          index: true,
        },
      ],
    });

    return partner;
  }
}
