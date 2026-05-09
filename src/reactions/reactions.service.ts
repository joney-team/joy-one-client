import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { DatabaseName } from '../database/database.types';
import { withMongoQuery } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import {
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { ReactionEntity } from './entities/reaction.entity';
import {
  AddReactionArgs,
  GetEntityReactionsArgs,
  ReactionCount,
  ReactionsCount,
  ReactionsPaginatedArgs,
  ReactionType,
  RemoveReactionArgs,
} from './reactions.types';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(ReactionEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<ReactionEntity>,

    private readonly queueProducers: QueueProducersService,
    private readonly cache: CacheService,
  ) {}

  async add(args: WithWorkspaceArgs<AddReactionArgs>) {
    const { workspaceId, member, entity, entityId, type } =
      withWorkspaceArgs(args);

    if (!member) {
      throw new ForbiddenException(AppMessage.WORKSPACE_MEMBER_NOT_FOUND);
    }

    if (!Object.values(AppEntity).includes(entity as AppEntity)) {
      throw new BadRequestException(AppMessage.ENTITY_NOT_FOUND);
    }

    const ref = `${member.userId}:${entity}:${entityId}:${type}`;

    const reaction =
      (await this.repository.findOne({
        where: { ref, workspaceId },
      })) ?? new ReactionEntity();

    reaction.workspaceId = workspaceId;
    reaction.userId = member.userId;
    reaction.type = type;
    reaction.ref = ref;
    reaction.entity = entity;
    reaction.entityId = entityId;

    await this.repository.save(reaction);
    await this.clearCountCache({ workspaceId, entity, entityId });

    this.queueProducers.captureEvent({
      type: EventType.REACTION_ADDED,
      actionType: EventDataActionType.CREATE,
      ref: reaction._id.toString(),
      workspaceId,
      userId: member.userId,
      relatedEntities: [
        {
          entity: entity as AppEntity,
          id: entityId,
          index: true,
        },
      ],
    });

    return true;
  }

  async remove(args: WithWorkspaceArgs<RemoveReactionArgs>) {
    const { workspaceId, member, entity, entityId, type } =
      withWorkspaceArgs(args);

    if (!member) {
      throw new ForbiddenException(AppMessage.WORKSPACE_MEMBER_NOT_FOUND);
    }

    const ref = `${member.userId}:${entity}:${entityId}:${type}`;

    const reaction = await this.repository.findOne({
      where: {
        ref,
        workspaceId,
        userId: member.userId,
      },
    });

    if (reaction) {
      await this.repository.remove(reaction);
      await this.clearCountCache({ workspaceId, entity, entityId });
    }

    this.queueProducers.captureEvent({
      type: EventType.REACTION_REMOVED,
      actionType: EventDataActionType.ARCHIVED,
      ref,
      workspaceId,
      userId: member.userId,
      relatedEntities: [
        {
          entity: entity as AppEntity,
          id: entityId,
          index: true,
        },
      ],
    });

    return true;
  }

  async clearCountCache(
    args: Pick<ReactionEntity, 'workspaceId' | 'entity' | 'entityId'>,
  ) {
    const { workspaceId, entity, entityId } = args;
    return this.cache
      .instance({
        instanceKey: `reactions:count:${workspaceId}:${entity}:${entityId}`,
      })
      .clearAll();
  }

  async count(
    args: WithWorkspaceArgs<GetEntityReactionsArgs>,
  ): Promise<ReactionsCount> {
    const { workspaceId, entity, entityId } = withWorkspaceArgs(args);

    const instance = this.cache.instance({
      instanceKey: `reactions:count:${workspaceId}:${entity}:${entityId}`,
      fallback: async () => {
        const reactions = await this.repository.find({
          where: { workspaceId, entity, entityId },
          select: ['_id', 'type', 'userId'],
        });

        const reactionCounts = reactions.reduce((acc, reaction) => {
          acc[reaction.type] = (acc[reaction.type] || 0) + 1;
          return acc;
        }, {});

        const entityReactions: ReactionCount[] = [];

        Object.values(ReactionType).forEach((value) => {
          entityReactions.push({
            type: value,
            count: reactionCounts[value] || 0,
            userIds: reactions
              .filter((reaction) => reaction.type === value)
              .map((reaction) => reaction.userId),
          });
        });

        return {
          reactions: entityReactions,
        };
      },
    });

    return instance.get({ workspaceId, entity, entityId });
  }

  async list(args: WithWorkspaceArgs<ReactionsPaginatedArgs>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        where: {
          ref: `${args.entity}:${args.entityId}`,
        },
        query: args,
        filterFields: ['type'],
      }),
    );

    return {
      count: data[1],
      data: data[0],
    };
  }
}
