import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { mustBeObjectId, withMongoQuery } from 'src/database/database.utils';
import { EventDataActionType, EventType } from 'src/events/events.types';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { AppEntity, PageMetadata } from '../app.types';
import { DatabaseName } from '../database/database.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { DateTime } from '../utils/date-time';
import { patchUpdateValue } from '../utils/patch-update-value';
import { StringUtils } from '../utils/string.utils';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { TagEntity } from './entities/tag.entity';
import { BulkUpdateTagsArgs, TagInput } from './tags.types';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<TagEntity>,
    private readonly queueProducers: QueueProducersService,
  ) {}

  randomSlug(name: string, prefix?: string) {
    const slug = StringUtils.toSlug(name);
    if (prefix) return `${prefix}-${slug}`;
    return slug;
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    let order = { order: 1 };

    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        order,
        filterFields: ['type'],
        allowGetAll: true,
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async getInternal(_id: string) {
    return this.repository.findOne({
      where: { _id: mustBeObjectId(_id) },
    });
  }

  async get(args: WithWorkspaceArgs<{ _id: string }>) {
    const { _id, workspaceId } = withWorkspaceArgs(args);
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(_id), workspaceId },
    });
    if (!data) throw new NotFoundException(AppMessage.TAG_NOT_FOUND);
    return data;
  }

  async getBySlug(slug: string) {
    const data = await this.repository.findOne({ where: { slug } });
    if (!data) throw new NotFoundException(AppMessage.TAG_NOT_FOUND);
    return data;
  }

  async getByIds(ids: string[], select?: (keyof TagEntity)[]) {
    return this.repository.find({
      where: {
        _id: { $in: ids.map(mustBeObjectId) },
      },
      select,
    });
  }

  async getMetadata(slug: string): Promise<PageMetadata> {
    const data = await this.getBySlug(slug);

    return {
      title: data.name,
      description: '',
    };
  }

  async save(data: TagEntity) {
    return new Promise((reolsve, reject) => {
      const action = async (retry: number) => {
        try {
          const slug = this.randomSlug(
            data.name,
            retry > 0 ? `-${retry}` : undefined,
          );
          data.slug = slug;

          const isExisted = await this.repository.findOne({ where: { slug } });
          if (isExisted) return action(retry + 1);

          await this.repository.save(data);
          reolsve(data);
        } catch (error) {
          if (retry > 100) return reject(error);
          action(retry + 1);
        }
      };

      action(0);
    });
  }

  async create(args: WithWorkspaceArgs<{ input: TagInput }>) {
    const { input, workspaceId, member } = withWorkspaceArgs(args);
    const data = new TagEntity();
    data.workspaceId = workspaceId;
    data.name = input.name;
    data.color = input.color || null;
    data.type = input.type;
    data.order = input.order ?? 0;

    data.createdByUserId = member.userId;

    await this.save(data);

    this.queueProducers.captureEvent({
      type: EventType.TAG_NEW,
      actionType: EventDataActionType.CREATE,
      workspaceId,
      userId: member.userId,
      ref: data._id.toString(),
      relatedEntities: [
        { entity: AppEntity.TAGS, id: data._id.toString(), index: true },
      ],
    });

    return data;
  }

  async bulkUpdate(args: WithWorkspaceArgs<BulkUpdateTagsArgs>) {
    const { items, workspaceId, member } = withWorkspaceArgs(args);

    const tags = await this.repository.find({
      where: {
        workspaceId,
        _id: { $in: items.map((v) => mustBeObjectId(v._id)) },
      },
    });

    const updatedTags = await Promise.all(
      tags.map(async (tag) => {
        if (member) validateWorkspaceAccessable({ member, data: tag });

        const input = items.find((v) => v._id === tag._id.toString());
        if (!input) throw new NotFoundException(AppMessage.TAG_NOT_FOUND);

        tag.name = patchUpdateValue(input.name, tag.name);
        tag.color = patchUpdateValue(input.color, tag.color);
        tag.order = patchUpdateValue(input.order, tag.order);
        await this.repository.save(tag);
        return tag;
      }),
    );

    this.queueProducers.captureEvent({
      type: EventType.TAGS_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId,
      userId: member.userId,
      relatedEntities: updatedTags.map((v) => ({
        entity: AppEntity.TAGS,
        id: v._id.toString(),
        index: true,
      })),
    });

    return updatedTags;
  }

  async remove(args: WithWorkspaceArgs<{ _id: string }>) {
    const { _id, member } = withWorkspaceArgs(args);
    const tag = await this.get(args);

    await this.repository.remove(tag);

    this.queueProducers.captureEvent({
      workspaceId: tag.workspaceId,
      actionType: EventDataActionType.ARCHIVED,
      userId: member?.userId,
      type: EventType.TAGS_ARCHIVED,
      ref: _id.toString(),
      relatedEntities: [
        { entity: AppEntity.TAGS, id: _id.toString(), index: true },
      ],
    });

    return tag;
  }

  async interact(args: WithWorkspaceArgs<{ _id: string }>) {
    const data = await this.get(args);
    data.lastInteractionAt = DateTime.getNowInSeconds();
    await this.repository.update(data._id, {
      lastInteractionAt: data.lastInteractionAt,
    });
  }
}
