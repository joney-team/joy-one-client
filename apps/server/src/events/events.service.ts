import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Server } from 'socket.io';
import { AppEntity } from 'src/app.types';
import { configs } from 'src/config/config';
import {
  bindData,
  mustBeObjectId,
  safeBindData,
  withMongoQuery,
} from 'src/database/database.utils';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UsersService } from 'src/users/users.service';
import { WithWorkspaceArgs } from 'src/workspaces/workspaces.utils';
import { MongoRepository } from 'typeorm';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { RelatedEntity } from '../database/database.entities';
import { DatabaseName } from '../database/database.types';
import { LoansService } from '../loans/loans.service';
import { PluginMailerService } from '../plugin-mailer/plugin-mailer.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { TasksService } from '../tasks/tasks.service';
import { DateTime } from '../utils/date-time';
import { WorkspaceMemberPublicInfo } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { EventEntity } from './events.entity';
import { eventsHandlers } from './events.handlers';
import {
  CaptureEventInput,
  EventChannel,
  EventType,
  SdkSendEventDto,
  SendUserEventInput,
} from './events.types';
import { MessageBoxesService } from 'src/message-boxes/message-boxes.service';

@Injectable()
export class EventsService {
  private server: Server;

  constructor(
    @InjectRepository(EventEntity, DatabaseName.MONGO)
    private repository: MongoRepository<EventEntity>,

    private readonly users: UsersService,
    private readonly workspaces: WorkspacesService,
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly tasks: TasksService,
    private readonly loans: LoansService,
    private readonly mailer: PluginMailerService,
    private readonly notifications: NotificationsService,
    private readonly messageBoxes: MessageBoxesService,

    private readonly queueProducers: QueueProducersService,
  ) {}

  setServer(server: Server) {
    this.server = server;
  }

  async get(_id: string) {
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(_id) },
    });
    if (!data) throw new NotFoundException(AppMessage.EVENT_NOT_FOUND);
    return data;
  }

  async bindData(entity: EventEntity) {
    return bindData<
      {
        user: WorkspaceMemberPublicInfo;
      },
      EventEntity
    >({
      entity,
      extends: {
        user: safeBindData({
          entity,
          field: 'userId',
          dependFields: ['workspaceId'],
          fetch: (id) =>
            this.workspaceMembers.getMemberInfo({
              userId: id,
              workspaceId: entity.workspaceId,
            }),
        }),
      },
    });
  }

  normalizeRelatedEntities(relatedEntities?: RelatedEntity[] | null) {
    if (!relatedEntities) return [];
    return relatedEntities.reduce((acc, v) => {
      if (!v.id || !v.entity || v.id === '') return acc;
      if (acc.find((v2) => v2.entity === v.entity && v2.id === v.id))
        return acc;
      acc.push({
        ...v,
        id: v.id.toString(),
      });
      return acc;
    }, [] as RelatedEntity[]);
  }

  async capture(input: CaptureEventInput) {
    const event = new EventEntity();

    event._id = new ObjectId();
    event.ref = input.ref;
    event.workspaceId = input.workspaceId;
    event.type = input.type;
    event.actionType = input.actionType;
    event.variant = input.variant;
    event.userId = input.userId;
    event.data = input.data || {};
    event.time = input.time || DateTime.getNowInSeconds();
    event.persist = input.persist ?? false;
    event.sessionId = input.sessionId;
    event.relatedEntities = this.normalizeRelatedEntities(
      input.relatedEntities,
    );
    event.channel = input.channel || EventChannel.WORKSPACE;
    event.reportTimeRange = input.reportTimeRange;

    if (input.ref) {
      const throttle = +configs.EVENT_THROTTLE_TIME;
      const throttleEvent = await this.repository.findOne({
        where: {
          ref: event.ref,
          workspaceId: event.workspaceId,
        },
        order: {
          time: -1,
        },
      });

      if (
        throttleEvent &&
        Math.ceil(event.time - throttleEvent.time) <= throttle &&
        throttleEvent.type === event.type &&
        throttleEvent.userId === event.userId
      ) {
        event._id = throttleEvent._id;
      }
    }

    if (event.persist) await this.repository.save(event);

    await this.handleEvent(event).catch(async (error) => {
      logger.error(error, { case: `Error when handle event` });
      if (event._id) await this.repository.remove(event);
      throw error;
    });

    const eventBindData = await this.bindData(event);

    if (event.channel === EventChannel.PERSONAL && event.userId) {
      const userClients = this.users.getClientsByUserId(event.userId);
      userClients.map((v) => {
        this.server.to(v.socketId).emit('EVENT_NEW', eventBindData);
      });
    }

    if (event.channel === EventChannel.WORKSPACE && event.workspaceId) {
      this.server.to(event.workspaceId).emit('EVENT_NEW', eventBindData);
    }

    // Send to all sdks
    this.sendSdkEvent({
      workspaceId: event.workspaceId,
      type: event.type,
      data: event,
    });

    return event;
  }

  async handleEvent(event: EventEntity) {
    const eventTitle = `event_type_${event.type}`;
    const relatedEntities = event.relatedEntities ?? [];
    const handlers = eventsHandlers[event.type] ?? [];

    await Promise.all(
      handlers.map((handler) =>
        handler({
          event,
          eventTitle,
          notifications: this.notifications,
          queueProducers: this.queueProducers,
          workspaceMembers: this.workspaceMembers,
          tasks: this.tasks,
          loans: this.loans,
          mailer: this.mailer,
          workspaces: this.workspaces,
          messageBoxes: this.messageBoxes,
        }),
      ),
    );

    // ======================= Reports =======================
    if (event.reportTimeRange && event.workspaceId) {
      await this.queueProducers.syncWorkspaceReports({
        triggerBy: `Event:${event.type}`,
        workspaceId: event.workspaceId,
        timeRange: event.reportTimeRange,
      });
    }

    // Search Index and Sync data
    for (const relatedEntity of relatedEntities) {
      if (!relatedEntity.id) continue;

      // Elasticseach indexing
      if (relatedEntity.index) {
        await this.queueProducers.searchIndex({
          ...relatedEntity,
          id: relatedEntity.id,
        });
      }

      // Self sync data
      if (
        relatedEntity.entity === AppEntity.LOANS &&
        event.type !== EventType.LOANS_SYNCED
      ) {
        await this.queueProducers.syncLoan(relatedEntity.id);
      }

      if (
        relatedEntity.entity === AppEntity.ORDERS &&
        event.type !== EventType.ORDER_SYNCED
      ) {
        await this.queueProducers.syncOrder(relatedEntity.id);
      }

      if (
        relatedEntity.entity === AppEntity.TASKS &&
        relatedEntity.id &&
        event.type !== EventType.TASK_SYNCED
      ) {
        await this.queueProducers.syncTask({
          _id: relatedEntity.id,
          workspaceId: event.workspaceId,
        });
      }

      if (
        relatedEntity.entity === AppEntity.ACTIVITIES &&
        relatedEntity.id &&
        event.type !== EventType.ACTIVITY_SYNCED
      ) {
        await this.queueProducers.syncActivity({
          _id: relatedEntity.id,
          workspaceId: event.workspaceId,
        });
      }
    }

    return event;
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    let where = {};

    if (args.query?.ref) {
      where['$or'] = [
        { ref: args.query.ref },
        { relatedEntities: { $elemMatch: { id: args.query.ref } } },
      ];
    }

    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        order: { time: -1 },
        filterFields: ['type', 'userId'],
        where,
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async sendUserEvent(dto: SendUserEventInput) {
    const userClients = this.users.getClientsByUserId(dto.userId);
    userClients.map((v) => {
      this.server.to(v.socketId).emit('USER_EVENT', dto);
    });
  }

  async sendSdkEvent(dto: SdkSendEventDto) {
    this.server.to(`sdk_${dto.workspaceId}`).emit('EVENT', dto);
  }
}
