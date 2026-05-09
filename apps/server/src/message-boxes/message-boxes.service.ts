import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { configs } from '../config/config';
import { messageBoxPlatformsExpireTime } from '../config/config.constants';
import { DatabaseName } from '../database/database.types';
import {
  mustBeObjectId,
  RawObjectId,
  withMongoQuery,
} from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { AppLocale } from '../lang/lang.types';
import { MessagesService } from './messages.service';
import {
  MessageAttachmentType,
  MessageResource,
  MessageType,
} from './messages.types';
import { PluginMessageHubsService } from '../plugin-message-hubs/plugin-message-hubs.service';
import { PluginMetaPagesService } from '../plugin-meta-pages/plugin-meta-pages.service';
import { PluginZaloOasService } from '../plugin-zalo-oas/plugin-zalo-oas.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { DateTime } from '../utils/date-time';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { MessageBoxEntity } from './entities/message-box.entity';
import { MessageBoxIntegration } from './message-boxes.integration';
import {
  AddMessageToBoxInput,
  MessageBoxPlatform,
  MessageBoxPlatformType,
  MessageBoxStatus,
  NotifyNewMessageBoxToZaloGmfGroup,
  SendFileMessageInput,
  SendImageMessageInput,
  SendTextMessageInput,
} from './message-boxes.types';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class MessageBoxesService {
  constructor(
    @InjectRepository(MessageBoxEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<MessageBoxEntity>,
    private readonly messages: MessagesService,
    @Inject(forwardRef(() => PluginMetaPagesService))
    private readonly pluginMetaPages: PluginMetaPagesService,
    @Inject(forwardRef(() => PluginZaloOasService))
    private readonly pluginZalo: PluginZaloOasService,
    @Inject(forwardRef(() => PluginMessageHubsService))
    private readonly pluginMessageHubs: PluginMessageHubsService,
    @Inject(forwardRef(() => PluginZaloOasService))
    private readonly pluginZaloOas: PluginZaloOasService,
    private readonly queueProducers: QueueProducersService,
    private readonly cache: CacheService,
  ) {}

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: [
          'customerId',
          'platformId',
          'platformType',
          'status',
          'assigneeUserId',
        ],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async get(args: WithOptionalWorkspaceArgs<{ id: RawObjectId }>) {
    const { id, member } = withOptionalWorkspaceArgs(args);

    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });

    if (!data) throw new NotFoundException();

    if (member) {
      validateWorkspaceAccessable({ member, data });
    }

    return data;
  }

  async getByIds(
    args: WithWorkspaceArgs<{
      ids: string[];
      select?: (keyof MessageBoxEntity)[];
    }>,
  ) {
    const { ids, select, member } = withWorkspaceArgs(args);
    if (!ids || ids.length === 0) return [];
    const data = await this.repository.find({
      where: { _id: { $in: ids.map(mustBeObjectId) } },
      select,
    });

    if (member) {
      data.forEach((box) => validateWorkspaceAccessable({ member, data: box }));
    }

    return data;
  }

  async close(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { member } = withWorkspaceArgs(args);
    const box = await this.get(args);
    box.status = MessageBoxStatus.CLOSED;
    await this.repository.save(box);

    this.queueProducers.captureEvent({
      ref: box._id.toString(),
      type: EventType.MESSAGE_BOX_CLOSED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: box.workspaceId,
      userId: member?.userId,
      data: box,
      relatedEntities: [
        {
          entity: AppEntity.MESSAGE_BOXES,
          id: box._id.toString(),
          index: true,
        },
        { entity: AppEntity.CUSTOMERS, id: box.customerId },
      ],
    });

    return box;
  }

  async setCustomer(
    args: WithWorkspaceArgs<{
      id: RawObjectId;
      customerId: RawObjectId | null;
    }>,
  ) {
    const { member, customerId } = withWorkspaceArgs(args);
    const box = await this.get(args);

    box.customerId = customerId ? mustBeObjectId(customerId).toString() : null;

    await this.repository.save(box);

    this.queueProducers.captureEvent({
      ref: box._id.toString(),
      type: EventType.MESSAGE_BOX_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: box.workspaceId,
      userId: member.userId,
      data: box,
      relatedEntities: [
        {
          entity: AppEntity.MESSAGE_BOXES,
          id: box._id.toString(),
          index: true,
        },
        { entity: AppEntity.CUSTOMERS, id: box.customerId },
      ],
    });

    return box;
  }

  async assignUser(
    args: WithWorkspaceArgs<{ id: RawObjectId; userId: RawObjectId | null }>,
  ) {
    const { member, userId } = withWorkspaceArgs(args);
    const box = await this.get(args);

    box.assigneeUserId = userId ? mustBeObjectId(userId).toString() : null;

    await this.repository.save(box);

    this.queueProducers.captureEvent({
      ref: box._id.toString(),
      type: EventType.MESSAGE_BOX_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: box.workspaceId,
      userId: member?.userId,
      data: box,
      relatedEntities: [
        {
          entity: AppEntity.MESSAGE_BOXES,
          id: box._id.toString(),
          index: true,
        },
        { entity: AppEntity.CUSTOMERS, id: box.customerId },
      ],
    });

    return box;
  }

  async addMessage(input: AddMessageToBoxInput) {
    const ref = `${input.workspaceId}-${input.platformType}-${input.platformId}-${input.senderId}`;
    const box =
      (await this.repository.findOne({ where: { ref } })) ||
      new MessageBoxEntity();

    const isNewBoxMessage = !box._id;

    // Skip if send and is new box message (Ads Messages)
    if (input.type === MessageType.SEND && isNewBoxMessage) {
      return undefined;
    }

    if (isNewBoxMessage) {
      box.ref = ref;
      box.workspaceId = input.workspaceId;
      box.platformId = input.platformId;
      box.platformType = input.platformType;
      box.senderId = input.senderId;
      box.customerId = input.customerId;
      box.createdAt = input.createdAt || DateTime.getNowInSeconds();
      await this.repository.save(box);
    }

    if (input.aiAssistantconversationId && !box.aiAssistantconversationId) {
      box.aiAssistantconversationId = input.aiAssistantconversationId;
      await this.repository.save(box);
    }

    box.senderName = input.senderName || box.senderName;
    box.senderAvatar = input.senderAvatar || box.senderAvatar;

    // Get Sender Info if not exists
    if ((!box.senderName || !box.senderAvatar) && input.getSenderInfo) {
      await input
        .getSenderInfo()
        .then(async ({ name, avatar, phone }) => {
          box.senderName = name;
          box.senderAvatar = avatar;
          box.phone = phone;

          await this.repository.save(box);

          if (!isNewBoxMessage)
            this.queueProducers.captureEvent({
              ref: box._id.toString(),
              type: EventType.MESSAGE_BOX_UPDATED,
              actionType: EventDataActionType.UPDATE,
              workspaceId: input.workspaceId,
              data: box,
              relatedEntities: [
                {
                  entity: AppEntity.MESSAGE_BOXES,
                  id: box._id.toString(),
                  index: true,
                },
                { entity: AppEntity.CUSTOMERS, id: box.customerId },
              ],
            });
        })
        .catch((error) => {
          logger.error(error, {
            case: `Failed to get sender info`,
          });
        });
    }

    // Update status
    if (input.type === MessageType.RECEIVE) {
      // Box has new Message
      if (!box.status || box.status === MessageBoxStatus.CLOSED) {
        box.status = MessageBoxStatus.WAITING;
        await this.repository.save(box);

        this.queueProducers.captureEvent({
          ref: box._id.toString(),
          type: EventType.MESSAGE_BOX_WAITING,
          actionType: EventDataActionType.UPDATE,
          workspaceId: input.workspaceId,
          data: {
            ...box,
            dto: input,
          },
          relatedEntities: [
            {
              entity: AppEntity.MESSAGE_BOXES,
              id: box._id.toString(),
              index: true,
            },
          ],
        });
      } else {
        this.queueProducers.captureEvent({
          ref: box._id.toString(),
          type: EventType.MESSAGE_BOX_NEW_MESSAGE,
          actionType: EventDataActionType.UPDATE,
          workspaceId: input.workspaceId,
          data: {
            ...box,
            dto: input,
          },
          relatedEntities: [
            {
              entity: AppEntity.MESSAGE_BOXES,
              id: box._id.toString(),
              index: true,
            },
          ],
        });
      }
    }

    if (
      input.type === MessageType.SEND &&
      box.status !== MessageBoxStatus.IN_PROGRESS
    ) {
      box.status = MessageBoxStatus.IN_PROGRESS;
      await this.repository.save(box);

      this.queueProducers.captureEvent({
        type: EventType.MESSAGE_BOX_IN_PROGRESS,
        actionType: EventDataActionType.UPDATE,
        workspaceId: input.workspaceId,
        data: box,
        ref: box._id.toString(),
        relatedEntities: [
          {
            entity: AppEntity.MESSAGE_BOXES,
            id: box._id.toString(),
            index: true,
          },
          { entity: AppEntity.CUSTOMERS, id: box.customerId },
        ],
      });
    }

    // Add Message
    const message = await this.messages.addMessage(box._id, {
      id: input.id,
      type: input.type,
      workspaceId: box.workspaceId,
      userId: input.userId,
      senderId: input.senderId,
      text: input.text,
      attachments: input.attachments,
      resource: input.resource,
    });

    // Auto Disable AI Assistant when staff send message
    if (
      input.resource === MessageResource.INTERNAL &&
      typeof box.aiAssistantDisabled !== 'boolean'
    ) {
      box.aiAssistantDisabled = true;
      await this.repository.save(box);

      this.queueProducers.captureEvent({
        type: EventType.MESSAGE_BOX_UPDATED,
        ref: box._id.toString(),
        actionType: EventDataActionType.UPDATE,
        workspaceId: box.workspaceId,
        data: box,
        relatedEntities: [
          {
            entity: AppEntity.MESSAGE_BOXES,
            id: box._id.toString(),
            index: true,
          },
          { entity: AppEntity.CUSTOMERS, id: box.customerId },
        ],
      });
    }

    // Update lastInteractionAt
    if (input.type === MessageType.RECEIVE) {
      const now = DateTime.getNowInSeconds();
      const expireTime = messageBoxPlatformsExpireTime[box.platformType] || 0;

      await this.repository
        .update(box._id, {
          lastInteractionAt: now,
          expireAt: expireTime ? now + expireTime : null,
        })
        .catch((error) => {
          logger.error(error, {
            case: `Failed to update last interaction at`,
          });
        });
    }

    // Assignee User
    if (!box.assigneeUserId && input.userId) {
      box.assigneeUserId = input.userId;
      await this.repository.save(box);

      this.queueProducers.captureEvent({
        type: EventType.MESSAGE_BOX_UPDATED,
        actionType: EventDataActionType.UPDATE,
        workspaceId: input.workspaceId,
        ref: box._id.toString(),
        data: box,
        relatedEntities: [
          {
            entity: AppEntity.MESSAGE_BOXES,
            id: box._id.toString(),
            index: true,
          },
          { entity: AppEntity.CUSTOMERS, id: box.customerId },
        ],
      });
    }

    // Trigger Event for New Box
    if (isNewBoxMessage) {
      this.queueProducers.captureEvent({
        type: EventType.MESSAGE_BOX_NEW,
        actionType: EventDataActionType.CREATE,
        workspaceId: input.workspaceId,
        data: box,
        ref: box._id.toString(),
        relatedEntities: [
          {
            entity: AppEntity.MESSAGE_BOXES,
            id: box._id.toString(),
            index: true,
          },
          { entity: AppEntity.CUSTOMERS, id: box.customerId },
        ],
      });
    }

    const isAbleToAddressAssistant =
      message.type === MessageType.RECEIVE &&
      message.resource !== MessageResource.AI_ASSISTANT;

    if (isAbleToAddressAssistant) {
      await this.queueProducers.aiAssistantResponseMessageBox({
        messageBoxId: box._id.toString(),
        workspaceId: box.workspaceId,
      });
    }

    return message;
  }

  getIntegration(
    id: string,
    platform: MessageBoxPlatformType,
  ): MessageBoxIntegration {
    if (platform === MessageBoxPlatformType.META_PAGE) {
      return this.pluginMetaPages.getMessageBoxIntegration(id);
    }

    if (platform === MessageBoxPlatformType.ZALO) {
      return this.pluginZalo.getMessageBoxIntegration(id);
    }

    if (platform === MessageBoxPlatformType.MESSAGE_HUB) {
      return this.pluginMessageHubs.getMessageBoxIntegration(id);
    }

    throw new NotFoundException(AppMessage.MESSAGE_BOX_INTEGRATION_NOT_FOUND);
  }

  async sendText(
    args: WithWorkspaceArgs<{
      boxId: RawObjectId;
      input: SendTextMessageInput;
    }>,
  ) {
    const { boxId, input, member } = withWorkspaceArgs(args);
    const box = await this.get({ ...args, id: boxId });

    const message = await this.addMessage({
      type: MessageType.SEND,
      platformId: box.platformId,
      platformType: box.platformType,
      userId: member?.userId,
      text: input.text,
      attachments: [],
      senderId: box.senderId,
      workspaceId: box.workspaceId,
      resource: input.resouce || MessageResource.INTERNAL,
      resouceId: input.aiAssistantMessageId,
    });

    try {
      const integration = this.getIntegration(box.platformId, box.platformType);

      const messageId = await integration.sendText({
        clientId: box.senderId,
        text: input.text,
      });

      this.messages.setSent(message._id.toString(), messageId);
    } catch (error) {
      logger.error(error, {
        case: `Failed to send text`,
      });

      this.messages.setFailed(message._id.toString(), error);
    }
  }

  async sendImage(
    args: WithWorkspaceArgs<{
      boxId: RawObjectId;
      input: SendImageMessageInput;
    }>,
  ) {
    const { boxId, input, member } = withWorkspaceArgs(args);
    const box = await this.get({ ...args, id: boxId });

    const message = await this.addMessage({
      type: MessageType.SEND,
      platformId: box.platformId,
      platformType: box.platformType,
      userId: member?.userId,
      attachments: [
        {
          type: MessageAttachmentType.IMAGE,
          url: input.url,
        },
      ],
      senderId: box.senderId,
      workspaceId: box.workspaceId,
      resource: MessageResource.INTERNAL,
    });

    const integration = this.getIntegration(box.platformId, box.platformType);

    try {
      const messageId = await integration.sendImage({
        clientId: box.senderId,
        url: input.url,
      });

      this.messages.setSent(message._id.toString(), messageId);
    } catch (error) {
      logger.error(error, {
        case: `Failed to send image`,
      });
      this.messages.setFailed(message._id.toString(), error);
    }
  }

  async sendFile(
    args: WithWorkspaceArgs<{
      boxId: RawObjectId;
      input: SendFileMessageInput;
    }>,
  ) {
    const { boxId, input, member } = withWorkspaceArgs(args);
    const box = await this.get({ ...args, id: boxId });

    const message = await this.addMessage({
      type: MessageType.SEND,
      platformId: box.platformId,
      platformType: box.platformType,
      userId: member?.userId,
      attachments: [
        {
          type: MessageAttachmentType.FILE,
          url: input.url,
        },
      ],
      senderId: box.senderId,
      workspaceId: box.workspaceId,
      resource: MessageResource.INTERNAL,
    });

    const integration = this.getIntegration(box.platformId, box.platformType);

    try {
      const messageId = await integration.sendFile({
        clientId: box.senderId,
        url: input.url,
      });

      this.messages.setSent(message._id.toString(), messageId);
    } catch (error) {
      logger.error(error, {
        case: `Failed to send file`,
      });
      this.messages.setFailed(message._id.toString(), error);
    }
  }

  async delete(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { member } = withWorkspaceArgs(args);
    const box = await this.get(args);

    await this.repository.delete(box._id);

    this.queueProducers.captureEvent({
      type: EventType.MESSAGE_BOX_REMOVED,
      ref: box._id.toString(),
      actionType: EventDataActionType.ARCHIVED,
      workspaceId: box.workspaceId,
      userId: member?.userId,
      data: box,
      relatedEntities: [
        {
          entity: AppEntity.MESSAGE_BOXES,
          id: box._id.toString(),
          index: true,
        },
        { entity: AppEntity.CUSTOMERS, id: box.customerId },
      ],
    });
  }

  async switchAiAssistant(
    args: WithWorkspaceArgs<{
      boxId: RawObjectId;
      disabled?: boolean;
    }>,
  ) {
    const { member, disabled, boxId } = withWorkspaceArgs(args);
    const box = await this.get({ ...args, id: boxId });

    box.aiAssistantDisabled =
      typeof disabled === 'boolean' ? disabled : !box.aiAssistantDisabled;

    await this.repository.save(box);

    this.queueProducers.captureEvent({
      ref: box._id.toString(),
      type: EventType.MESSAGE_BOX_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: box.workspaceId,
      userId: member?.userId,
      data: box,
      relatedEntities: [
        {
          entity: AppEntity.MESSAGE_BOXES,
          id: box._id.toString(),
          index: true,
        },
        { entity: AppEntity.CUSTOMERS, id: box.customerId },
      ],
    });

    return box;
  }

  async notifyNewMessageBoxToZaloGmfGroup(
    input: NotifyNewMessageBoxToZaloGmfGroup,
  ) {
    const box = await this.get({
      id: input.messageBoxId,
      workspaceId: input.workspaceId,
    });

    await this.pluginZaloOas.sendGmfGroupMessage({
      workspaceId: box.workspaceId,
      message: `💬 Tin nhắn mới: ${box.senderName || 'Khách hàng chưa xác định'}
Thời gian: ${DateTime.format(box.lastInteractionAt, { locale: AppLocale.vi })}
Chi tiết: ${configs.APP_URL}/message-boxes/${box._id}`,
    });
  }

  async clearListPlatformsCache(args: WithWorkspaceArgs) {
    const { workspaceId } = withWorkspaceArgs(args);
    const instance = this.cache.instance({
      instanceKey: 'message-box-platforms',
    });

    await instance.clear(mustBeObjectId(workspaceId).toString());

    await this.queueProducers.captureEvent({
      type: EventType.MESSAGE_BOXES_PLATFORMS_UPDATED,
      workspaceId,
      actionType: EventDataActionType.UPDATE,
    });
  }

  async listPlatforms(args: WithWorkspaceArgs): Promise<MessageBoxPlatform[]> {
    const { workspaceId } = withWorkspaceArgs(args);
    const instance = this.cache.instance({
      instanceKey: 'message-box-platforms',
      fallback: async () => {
        const [pages, oas, messageHubs] = await Promise.all([
          this.pluginMetaPages.getPages({ workspaceId }),
          this.pluginZalo.getOas(workspaceId),
          this.pluginMessageHubs.getChannels(workspaceId),
        ]);

        const platforms: MessageBoxPlatform[] = [
          ...pages.map((page) => ({
            id: page.id,
            name: page.name,
            type: MessageBoxPlatformType.META_PAGE,
            image: page.logo,
            enabled: !page.isDisabled,
          })),
          ...oas.map((oa) => ({
            id: oa.id,
            name: oa.info.name,
            type: MessageBoxPlatformType.ZALO,
            image: oa.info.avatar,
            enabled: !oa.isDisabled,
          })),
          ...messageHubs.map((hub) => ({
            id: hub._id,
            name: hub.name,
            type: MessageBoxPlatformType.MESSAGE_HUB,
            enabled: true,
          })),
        ];

        return platforms;
      },
    });

    return instance.get(mustBeObjectId(workspaceId).toString());
  }
}
