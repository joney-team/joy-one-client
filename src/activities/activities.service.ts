import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId, withMongoQuery } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { DateTime } from '../utils/date-time';
import { diffMentionedIds, extractMentionedIds } from '../utils/editor.utils';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { ActivityEntity } from './entities/activity.entity';
import {
  ActivityPaginatedArgs,
  AddActivityArgs,
  GetActivityArgs,
  UpdateActivityArgs,
} from './activities.types';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ActivityEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<ActivityEntity>,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async list(args: WithWorkspaceArgs<ActivityPaginatedArgs>) {
    const where = args.parentId
      ? { parentId: args.parentId }
      : { parentId: { $eq: null } };

    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        where,
        query: args,
        filterFields: ['parentId', 'contextType', 'contextId', 'type'],
        order: { createdAt: 1 },
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async get(args: WithWorkspaceArgs<{ id: string }>) {
    const { workspaceId, member } = withWorkspaceArgs(args);
    const activity = await this.repository.findOne({
      where: {
        workspaceId,
        _id: mustBeObjectId(args.id),
      },
    });
    if (!activity) throw new NotFoundException(AppMessage.ACTIVITY_NOT_FOUND);
    if (member) validateWorkspaceAccessable({ member, data: activity });
    return activity;
  }

  async add(args: WithWorkspaceArgs<AddActivityArgs>) {
    const { workspaceId, member } = withWorkspaceArgs(args);

    const activity = new ActivityEntity();
    activity.contextType = args.contextType;
    activity.contextId = args.contextId;
    activity.type = args.type;
    activity.content = args.content;
    activity.parentId = args.parentId ?? null;
    activity.workspaceId = workspaceId;
    activity.createdByUserId = member?.userId;
    activity.createdAt = DateTime.getNowInSeconds();

    if (args.parentId) {
      const parent = await this.repository.findOne({
        where: { _id: mustBeObjectId(args.parentId) },
      });

      if (!parent) {
        throw new NotFoundException(AppMessage.ACTIVITY_NOT_FOUND);
      }

      if (parent.parentId) {
        throw new BadRequestException(AppMessage.CANNOT_CREATE_NESTED_ACTIVITY);
      }
    }

    await this.repository.save(activity);
    await this.queueProducers.captureEvent({
      type: EventType.ACTIVITY_NEW,
      actionType: EventDataActionType.CREATE,
      workspaceId,
      ref: activity._id.toString(),
      userId: member?.userId,
      relatedEntities: [
        {
          entity: AppEntity.ACTIVITIES,
          id: activity._id.toString(),
          index: true,
        },
        {
          entity: AppEntity.ACTIVITIES,
          id: activity.parentId,
          index: true,
        },
      ],
    });
    return activity;
  }

  async update(args: WithWorkspaceArgs<UpdateActivityArgs>) {
    const { member } = withWorkspaceArgs(args);

    const activity = await this.get(args);

    if (member && activity.createdByUserId !== member.userId) {
      throw new ForbiddenException(AppMessage.ACCESS_DENIED);
    }

    activity.content = args.content;
    activity.contentLastModifiedAt = DateTime.getNowInSeconds();

    await this.repository.save(activity);
    await this.queueProducers.captureEvent({
      type: EventType.ACTIVITY_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: activity.workspaceId,
      ref: activity._id.toString(),
      userId: member?.userId,
      relatedEntities: [
        {
          entity: AppEntity.ACTIVITIES,
          id: activity._id.toString(),
          index: true,
        },
        {
          entity: AppEntity.ACTIVITIES,
          id: activity.parentId,
          index: true,
        },
      ],
    });
    return activity;
  }

  async archive(args: WithWorkspaceArgs<GetActivityArgs>) {
    const { member } = withWorkspaceArgs(args);
    const activity = await this.get(args);

    if (member && activity.createdByUserId !== member.userId) {
      throw new ForbiddenException(AppMessage.ACCESS_DENIED);
    }

    activity.isArchived = true;

    await this.repository.save(activity);
    await this.queueProducers.captureEvent({
      type: EventType.ACTIVITY_ARCHIVED,
      actionType: EventDataActionType.ARCHIVED,
      workspaceId: activity.workspaceId,
      ref: activity._id.toString(),
      userId: member?.userId,
      relatedEntities: [
        {
          entity: AppEntity.ACTIVITIES,
          id: activity._id.toString(),
          index: true,
        },
        {
          entity: AppEntity.ACTIVITIES,
          id: activity.parentId,
          index: true,
        },
      ],
    });
    return activity;
  }

  async unarchive(args: WithWorkspaceArgs<GetActivityArgs>) {
    const { member } = withWorkspaceArgs(args);
    const activity = await this.get(args);

    if (member && activity.createdByUserId !== member.userId) {
      throw new ForbiddenException(AppMessage.ACCESS_DENIED);
    }

    activity.isArchived = false;
    await this.repository.save(activity);
    return activity;
  }

  async pin(args: WithWorkspaceArgs<GetActivityArgs>) {
    const { member } = withWorkspaceArgs(args);
    const activity = await this.get(args);

    if (member && activity.createdByUserId !== member.userId) {
      throw new ForbiddenException(AppMessage.ACCESS_DENIED);
    }

    activity.isPinned = true;
    activity.pinnedAt = DateTime.getNowInSeconds();

    if (member) {
      activity.pinnedByUserId = member.userId;
    }

    await this.repository.save(activity);
    return activity;
  }

  async getMentionedUserIds(activity: ActivityEntity) {
    try {
      if (!activity.content) return [];
      const description = JSON.parse(activity.content);
      const mentionedUserIds = extractMentionedIds(
        description,
        AppEntity.USERS,
      );
      return mentionedUserIds;
    } catch (error) {
      return activity.mentionedUserIds ?? [];
    }
  }

  async sync(args: WithWorkspaceArgs<{ _id: string }>) {
    const { workspaceId, _id } = withWorkspaceArgs(args);
    const activity = await this.get({ workspaceId, id: _id });
    const updateInfos: string[] = [];

    // Sync mentioned user ids
    const mentionedUserIds = await this.getMentionedUserIds(activity);
    const { added: addedMentionedUserIds, removed: removedMentionedUserIds } =
      diffMentionedIds(activity.mentionedUserIds ?? [], mentionedUserIds);
    if (
      addedMentionedUserIds.length > 0 ||
      removedMentionedUserIds.length > 0
    ) {
      activity.mentionedUserIds = mentionedUserIds;
      updateInfos.push('SYNC_MENTIONED_USER_IDS');
    }

    // Sync child count
    const child = await this.repository.findAndCount({
      where: { parentId: activity._id.toString(), isArchived: { $ne: true } },
      select: ['_id'],
    });

    if (child[1] !== activity.childCount) {
      activity.childCount = child[1];
      updateInfos.push('SYNC_CHILD_COUNT');
    }

    if (updateInfos.length > 0) {
      await this.repository.save(activity);

      await this.queueProducers.captureEvent({
        type: EventType.ACTIVITY_SYNCED,
        actionType: EventDataActionType.UPDATE,
        workspaceId,
        ref: activity._id.toString(),
      });
    }

    return {
      updateInfos,
    };
  }
}
