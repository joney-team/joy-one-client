import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from 'src/workspaces/workspaces.utils';
import { configs } from '../config/config';
import { EventDataActionType, EventType } from '../events/events.types';
import { parseFileFromUrl, renderFileLink } from '../files/files.utils';
import {
  MessageBoxIntegration,
  MessageBoxIntegrationSendFilePayload,
  MessageBoxIntegrationSendImagePayload,
  MessageBoxIntegrationSendTextPayload,
} from '../message-boxes/message-boxes.integration';
import { MessageBoxesService } from '../message-boxes/message-boxes.service';
import { MessageBoxPlatformType } from '../message-boxes/message-boxes.types';
import {
  MessageAttachmentType,
  MessageResource,
  MessageType,
} from '../message-boxes/messages.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { pluginMessageHubsRequest } from './plugin-message-hubs.request';
import {
  ChannelSendMessageDto,
  MessageHubClient,
  PluginMessageHub,
  PluginMessageHubInput,
  PluginMessageHubMessage,
  PluginMessageHubWebhook,
} from './plugin-message-hubs.types';

@Injectable()
export class PluginMessageHubsService {
  constructor(
    @Inject(forwardRef(() => MessageBoxesService))
    private readonly messageBoxes: MessageBoxesService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async getChannels(workspaceId: string): Promise<PluginMessageHub[]> {
    try {
      const resulst = await pluginMessageHubsRequest.get(`/channels`, {
        params: { workspaceId },
      });
      return resulst.data;
    } catch (error) {
      return [];
    }
  }

  async create(args: WithWorkspaceArgs<{ input: PluginMessageHubInput }>) {
    const { input, workspaceId, member } = withWorkspaceArgs(args);
    const payload: PluginMessageHubInput = {
      name: input.name,
      widgetSettings: {
        ...input.widgetSettings,
        brandLogo: input.widgetSettings.brandLogo
          ? renderFileLink(input.widgetSettings.brandLogo)
          : '',
      },
    };

    const hub = await pluginMessageHubsRequest.post(`/channels`, {
      ...payload,
      ref: workspaceId,
      webhookUrl: `${configs.API_URL}/plugins/message-hubs/webhook`,
    });

    this.queueProducers.captureEvent({
      actionType: EventDataActionType.CREATE,
      type: EventType.PLUGIN_MESSAGE_HUBS_NEW,
      workspaceId,
      userId: member?.userId,
      data: { hubId: hub._id },
      persist: true,
    });

    return hub;
  }

  async get(id: string): Promise<PluginMessageHub> {
    const channel = await pluginMessageHubsRequest
      .get<PluginMessageHub>(`/channels/${id}`)
      .catch(() => null);
    if (!channel) throw new NotFoundException();
    return channel;
  }

  async update(
    args: WithWorkspaceArgs<{ id: string; input: PluginMessageHubInput }>,
  ) {
    const { id, input, workspaceId, member } = withWorkspaceArgs(args);
    const payload: PluginMessageHubInput = {
      name: input.name,
      widgetSettings: {
        ...input.widgetSettings,
        brandLogo: input.widgetSettings.brandLogo
          ? renderFileLink(input.widgetSettings.brandLogo)
          : '',
      },
    };

    const hub = await pluginMessageHubsRequest.put(`/channels/${id}`, {
      ...payload,
      ref: workspaceId,
      webhookUrl: `${configs.API_URL}/plugins/message-hubs/webhook`,
    });

    this.queueProducers.captureEvent({
      actionType: EventDataActionType.UPDATE,
      type: EventType.PLUGIN_MESSAGE_HUBS_UPDATED,
      workspaceId: workspaceId,
      userId: member?.userId,
      data: { hubId: hub._id },
      persist: true,
    });

    return hub;
  }

  async remove(args: WithWorkspaceArgs<{ id: string }>) {
    const { id, workspaceId, member } = withWorkspaceArgs(args);
    const channel = await this.get(id);
    await pluginMessageHubsRequest.delete(`/channels/${id}`);

    if (workspaceId !== channel.ref) {
      throw new ForbiddenException();
    }

    this.queueProducers.captureEvent({
      actionType: EventDataActionType.ARCHIVED,
      type: EventType.PLUGIN_MESSAGE_HUBS_REMOVED,
      workspaceId: workspaceId,
      userId: member?.userId,
      data: { hubId: channel._id },
      persist: true,
    });
  }

  async getClient(id: string) {
    return pluginMessageHubsRequest.get<MessageHubClient>(`/clients/${id}`);
  }

  async webhook(payload: PluginMessageHubWebhook) {
    const { type, channelId, data } = payload;
    const channel = await pluginMessageHubsRequest.get<PluginMessageHub>(
      `/channels/${channelId}`,
    );

    if (type === 'MESSAGE') {
      const message = { ...data } as PluginMessageHubMessage;

      if (message.type === 'CLIENT') {
        await this.messageBoxes.addMessage({
          id: message._id.toString(),
          workspaceId: channel.ref,
          platformId: channel._id,
          platformType: MessageBoxPlatformType.MESSAGE_HUB,
          type: MessageType.RECEIVE,
          senderId: message.clientId,
          text: message.text,
          attachments: message.attachments,
          createdAt: message.createdAt,
          resource: MessageResource.WEBHOOK,
          getSenderInfo: async () => {
            const client = await this.getClient(message.clientId);
            return {
              name: client.data?.name,
              avatar: client.data?.avatar,
              phone: client.data?.phone,
            };
          },
        });
      }

      if (message.type === 'CHANNEL') {
        await this.messageBoxes.addMessage({
          id: message._id.toString(),
          workspaceId: channel.ref,
          platformId: channel._id,
          platformType: MessageBoxPlatformType.MESSAGE_HUB,
          type: MessageType.SEND,
          senderId: message.clientId,
          text: message.text,
          attachments: message.attachments,
          createdAt: message.createdAt,
          resource: MessageResource.WEBHOOK,
        });
      }
    }
  }

  async send(dto: ChannelSendMessageDto) {
    return pluginMessageHubsRequest.post<PluginMessageHubMessage>(
      `/messages`,
      dto,
    );
  }

  async list(query?: any) {
    try {
      const resulst = await pluginMessageHubsRequest.get(`/channels`, query);
      return resulst.data;
    } catch (error) {
      return [];
    }
  }

  getMessageBoxIntegration(channelId: string): MessageBoxIntegration {
    return {
      sendText: async (payload: MessageBoxIntegrationSendTextPayload) => {
        const _payload: ChannelSendMessageDto = {
          clientId: payload.clientId,
          text: payload.text,
        };

        const message = await this.send(_payload);
        return message._id.toString();
      },
      sendImage: async (payload: MessageBoxIntegrationSendImagePayload) => {
        const _payload: ChannelSendMessageDto = {
          clientId: payload.clientId,
          attachments: [
            {
              type: MessageAttachmentType.IMAGE,
              url: payload.url,
            },
          ],
        };

        const message = await this.send(_payload);
        return message._id.toString();
      },
      sendFile: async (payload: MessageBoxIntegrationSendFilePayload) => {
        const _payload: ChannelSendMessageDto = {
          clientId: payload.clientId,
          attachments: [
            {
              type: MessageAttachmentType.FILE,
              url: payload.url,
            },
          ],
        };

        const message = await this.send(_payload);
        return message._id.toString();
      },
      getSenderInfo: async (message: PluginMessageHubMessage) => {
        const client = await this.getClient(message.clientId);
        return {
          name: client.data?.name,
          avatar: client.data?.avatar,
          phone: client.data?.phone,
        };
      },
      parseMessage: async (message: PluginMessageHubMessage) => {
        return {
          messageId: message._id.toString(),
          clientId: message.clientId,
          attachments: message.attachments.map((att) => {
            const file = parseFileFromUrl(att.url);
            return {
              type: file.type,
              name: file.fileName,
              extension: file.extension,
              url: att.url,
            };
          }),
          text: message.text,
        };
      },
    };
  }
}
