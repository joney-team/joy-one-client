import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppEntity } from '../app.types';
import { DatabaseName } from '../database/database.types';
import {
  mustBeObjectId,
  RawObjectId,
  withMongoQuery,
} from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { getErrorMessage } from '../utils/log.utils';
import { WithWorkspaceArgs } from '../workspaces/workspaces.utils';
import { MessageEntity } from './entities/message.entity';
import { AddMessageInput, MessageStatus } from './messages.types';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<MessageEntity>,

    private readonly queueProducers: QueueProducersService,
  ) {}

  async addMessage(boxId: RawObjectId, input: AddMessageInput) {
    if (input.id) {
      const existed = await this.repository.findOne({
        where: { id: input.id },
      });
      if (existed) return existed;
    }

    const message = new MessageEntity();
    message.id = input.id;
    message.boxId = mustBeObjectId(boxId).toString();
    message.text = input.text;
    message.attachments = input.attachments || [];
    message.userId = input.userId;
    message.senderId = input.senderId;
    message.workspaceId = input.workspaceId;
    message.type = input.type;
    message.status = input.id ? MessageStatus.SENT : MessageStatus.PENDING;
    message.resource = input.resource;
    message.resouceId = input.resouceId;

    await this.repository.save(message);

    this.queueProducers.captureEvent({
      type: EventType.MESSAGE_NEW,
      actionType: EventDataActionType.CREATE,
      ref: message._id.toString(),
      workspaceId: input.workspaceId,
      userId: input.userId,
      data: message,
      relatedEntities: [
        { entity: AppEntity.MESSAGES, id: message._id.toString(), index: true },
        { entity: AppEntity.MESSAGE_BOXES, id: message.boxId },
      ],
    });

    return message;
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['userId', 'senderId', 'boxId', 'type', 'resource'],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async get(id: RawObjectId) {
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!data) throw new NotFoundException();
    return data;
  }

  async setFailed(id: RawObjectId, error: any) {
    const message = await this.get(id);
    message.status = MessageStatus.SENT_FAILED;
    message.failedReason = getErrorMessage(error);

    await this.repository.update(message._id, {
      status: MessageStatus.SENT_FAILED,
      failedReason: message.failedReason,
    });

    this.queueProducers.captureEvent({
      type: EventType.MESSAGE_UPDATED,
      ref: message._id.toString(),
      workspaceId: message.workspaceId,
      actionType: EventDataActionType.UPDATE,
      data: message,
      relatedEntities: [
        { entity: AppEntity.MESSAGES, id: message._id.toString(), index: true },
        { entity: AppEntity.MESSAGE_BOXES, id: message.boxId },
      ],
    });

    return message;
  }

  async setStatus(id: RawObjectId, status: MessageStatus) {
    const message = await this.get(id);
    message.status = status;

    await this.repository.update(message._id, { status });

    this.queueProducers.captureEvent({
      type: EventType.MESSAGE_UPDATED,
      actionType: EventDataActionType.UPDATE,
      ref: message._id.toString(),
      workspaceId: message.workspaceId,
      data: message,
      relatedEntities: [
        { entity: AppEntity.MESSAGES, id: message._id.toString(), index: true },
        { entity: AppEntity.MESSAGE_BOXES, id: message.boxId },
      ],
    });

    return message;
  }

  async setSent(id: RawObjectId, messageId: string) {
    const message = await this.get(id);
    message.id = messageId;

    if (!message.status || message.status === MessageStatus.PENDING) {
      message.status = MessageStatus.SENT;
    }

    await this.repository.update(message._id, {
      id: message.id,
      status: message.status,
    });

    this.queueProducers.captureEvent({
      type: EventType.MESSAGE_UPDATED,
      ref: message._id.toString(),
      workspaceId: message.workspaceId,
      actionType: EventDataActionType.UPDATE,
      data: message,
      relatedEntities: [
        { entity: AppEntity.MESSAGES, id: message._id.toString(), index: true },
        { entity: AppEntity.MESSAGE_BOXES, id: message.boxId },
      ],
    });

    return message;
  }
}
