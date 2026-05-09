import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosError } from 'axios';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from 'src/workspaces/workspaces.utils';
import { MongoRepository } from 'typeorm';
import { logger } from '../app.logger';
import { configs, IS_DEV } from '../config/config';
import { forwardWebhookUrls } from '../config/config.constants';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId, RawObjectId } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { parseFileFromUrl, renderFileLink } from '../files/files.utils';
import { MessageBoxIntegration } from '../message-boxes/message-boxes.integration';
import { MessageBoxesService } from '../message-boxes/message-boxes.service';
import { MessageBoxPlatformType } from '../message-boxes/message-boxes.types';
import {
  MessageAttachment,
  MessageAttachmentType,
  MessageResource,
  MessageType,
} from '../message-boxes/messages.types';
import { MetaService } from '../meta/meta.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { cryptoEncrypt } from '../utils/crypto.util';
import { DateTime } from '../utils/date-time';
import { PluginMetaPageEntity } from './plugin-meta-pages.entity';
import { PluginMetaPageInstance } from './plugin-meta-pages.instance';
import {
  ForwardMetaWebhookDto,
  PluginMetaMessageType,
  PluginMetaPageInfo,
  PluginMetaPageInfoStatus,
  PluginMetaPageStatus,
} from './plugin-meta-pages.types';

@Injectable()
export class PluginMetaPagesService {
  constructor(
    @InjectRepository(PluginMetaPageEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<PluginMetaPageEntity>,
    @Inject(forwardRef(() => MessageBoxesService))
    private readonly messageBoxes: MessageBoxesService,
    private readonly meta: MetaService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  subscriptions = [
    'message_deliveries',
    'message_echoes',
    'message_edits',
    'message_reactions',
    'message_reads',
    'messages',
  ];

  async getPages(args: WithWorkspaceArgs) {
    const { workspaceId } = withWorkspaceArgs(args);
    const pages = await this.repository.find({
      where: { workspaceId },
    });

    return pages;
  }

  async get(args: WithOptionalWorkspaceArgs<{ id: RawObjectId }>) {
    const { id, member } = withOptionalWorkspaceArgs(args);
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!data) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ data, member });
    return data;
  }

  async getByPageId(args: WithOptionalWorkspaceArgs<{ pageId: string }>) {
    const { pageId, member } = withOptionalWorkspaceArgs(args);
    const data = await this.repository.findOne({ where: { id: pageId } });
    if (!data) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ data, member });
    return data;
  }

  async getPagesInfos(args: WithWorkspaceArgs<{ accessToken: string }>) {
    const { workspaceId, accessToken } = withWorkspaceArgs(args);

    const [account, longLivedToken] = await Promise.all([
      this.meta.get(`/me`, {
        params: {
          access_token: accessToken,
        },
      }),
      this.meta.get('/oauth/access_token', {
        params: {
          client_id: configs.META_APP_ID,
          client_secret: configs.META_APP_SECRET,
          grant_type: 'fb_exchange_token',
          fb_exchange_token: accessToken,
        },
      }),
    ]);

    const _pages = await this.meta.get(`/${account.id}/accounts`, {
      params: longLivedToken,
    });

    const pages: PluginMetaPageInfo[] = await Promise.all(
      _pages.data.map(async (p: any) => {
        const pageEntity = await this.repository.findOne({
          where: { id: p.id },
        });

        const avatar = await this.meta
          .get(`/${p.id}/picture`, {
            params: {
              access_token: p.access_token,
              redirect: 0,
              type: 'normal',
            },
          })
          .catch(() => ({}));

        const info: PluginMetaPageInfo = {
          pageId: p.id,
          name: p.name,
          categories: p.category_list,
          accessToken: p.access_token,
          avatar: avatar?.data?.url,
          status: pageEntity
            ? pageEntity.workspaceId === workspaceId
              ? PluginMetaPageInfoStatus.CONNECTED
              : PluginMetaPageInfoStatus.CONNECTED_WITH_OTHER_WORKSPACE
            : PluginMetaPageInfoStatus.NOT_CONNECTED,
        };

        return info;
      }),
    );

    return pages;
  }

  async connectPages(args: WithWorkspaceArgs<{ accessToken: string }>) {
    const { workspaceId, member } = withWorkspaceArgs(args);
    const pagesInfo = await this.getPagesInfos(args);

    const pages = await Promise.all(
      pagesInfo.map(async (page) => {
        const entity =
          (await this.repository.findOne({ where: { id: page.pageId } })) ||
          new PluginMetaPageEntity();

        entity.workspaceId = workspaceId;
        entity.id = page.pageId;
        entity.name = page.name;
        entity.logo = page.avatar;
        entity.accessToken = cryptoEncrypt(
          { accessToken: page.accessToken },
          configs.ENCRYPT_PASSWORD,
        );
        entity.status = PluginMetaPageStatus.ACTIVE;

        await this.repository.save(entity);

        await this.setPagesSubscriptions(entity).catch((err) => {
          logger.error(err, {
            case: `Set Meta Page subscriptions failed`,
            fields: {
              workspaceId,
              pageId: page.pageId,
              pageInternalId: entity._id.toString(),
            },
          });
        });

        return entity;
      }),
    );

    this.queueProducers.captureEvent({
      type: EventType.PLUGIN_META_PAGES_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId,
      userId: member?.userId,
    });

    return pages;
  }

  async disconnect(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { member } = withWorkspaceArgs(args);

    const plugin = await this.get(args);

    await this.repository.delete(plugin._id);

    this.queueProducers.captureEvent({
      type: EventType.PLUGIN_META_PAGES_DISCONNECTED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: plugin.workspaceId,
      ref: plugin._id.toString(),
      userId: member?.userId,
    });

    return true;
  }

  async request(
    pageId: string,
    args: { method: string; path: string; config?: any },
  ) {
    const page = await this.get({ id: pageId });
    const instance = await this.getPageInstance(page);
    return instance[args.method](args.path, args.config).catch((error: any) => {
      if (error instanceof AxiosError) {
        throw new HttpException(error.message, error.status, {
          description: error.response.data,
        });
      }

      throw new BadRequestException(error.message);
    });
  }

  async getMessage(pageId: string, msgId: string) {
    const page = await this.get({ id: pageId });
    const instance = await this.getPageInstance(page);
    const result = await instance.get(`/${msgId}`, {
      params: {
        fields: 'id,created_time,from,to,message',
      },
    });

    const picture = await instance
      .get(`/${result.from.id}/picture`, {
        params: {
          redirect: 0,
          type: 'normal',
        },
      })
      .catch(() => ({}));

    return {
      ...result,
      from: {
        ...result.from,
        avatar: picture?.data?.url,
      },
    };
  }

  detectType(message: any) {
    if (message.message) return PluginMetaMessageType.MESSAGE;
    if (message.read) return PluginMetaMessageType.READED;
    if (message.delivery) return PluginMetaMessageType.MESSAGE_DELIVERY;
    logger.info(`Unknown message type`, {
      fields: {
        message,
      },
    });
  }

  convertMessage(message: any) {
    return {
      id: message.message.mid,
      text: message.message?.text,
      attachments: ((message.message?.attachments || []) as any[]).reduce(
        (out: MessageAttachment[], item) => {
          if (item.type === 'image' && item.payload.sticker_id) {
            out.push({
              type: MessageAttachmentType.STICKER,
              url: item.payload.url,
              raw: item,
            });
          } else if (item.type === 'image') {
            out.push({
              type: MessageAttachmentType.IMAGE,
              url: item.payload.url,
              raw: item,
            });
          } else {
            out.push({
              type: MessageAttachmentType.UNKNOWN,
              raw: item,
            });
          }
          return out;
        },
        [] as MessageAttachment[],
      ),
      createdAt: DateTime.toSeconds(message.timestamp),
    };
  }

  async handleMessage(message: any) {
    const messageId = message.message?.mid;
    const senderId = message.sender?.id;
    const receipientId = message.recipient?.id;

    const emitPage = senderId
      ? await this.getByPageId(senderId).catch(() => null)
      : null;
    const onPage = receipientId
      ? await this.getByPageId(receipientId).catch(() => null)
      : null;

    if (emitPage) {
      const type = this.detectType(message);
      if (type === PluginMetaMessageType.MESSAGE) {
        await this.messageBoxes.addMessage({
          type: MessageType.SEND,
          platformType: MessageBoxPlatformType.META_PAGE,
          platformId: emitPage.id,
          workspaceId: emitPage.workspaceId,
          senderId: receipientId,
          ...this.convertMessage(message),
          resource: MessageResource.WEBHOOK,
        });
      }
    }

    if (onPage) {
      // Page receive message
      const type = this.detectType(message);
      if (type === PluginMetaMessageType.MESSAGE) {
        await this.messageBoxes.addMessage({
          type: MessageType.RECEIVE,
          platformType: MessageBoxPlatformType.META_PAGE,
          platformId: onPage.id,
          workspaceId: onPage.workspaceId,
          senderId: senderId,
          getSenderInfo: async () => {
            const messageData = await this.getMessage(onPage._id, messageId);
            return messageData.from;
          },
          ...this.convertMessage(message),
          resource: MessageResource.WEBHOOK,
        });
      }

      if (type === PluginMetaMessageType.READED) {
        // TODO: Handle readed message
      }
    }
  }

  async getPageInstance(
    page: PluginMetaPageEntity,
    args?: { baseUrl?: string },
  ) {
    return new PluginMetaPageInstance(page, this.repository, args);
  }

  async getPageInstanceById(pageId: string) {
    const page = await this.getByPageId({ pageId });
    return this.getPageInstance(page);
  }

  async getAppInstance(args?: { baseURL?: string }) {
    const accessToken = await axios
      .get(`https://graph.facebook.com/oauth/access_token`, {
        params: {
          client_id: configs.META_APP_ID,
          client_secret: configs.META_APP_SECRET,
          grant_type: 'client_credentials',
        },
      })
      .then((res) => res.data.access_token)
      .catch((error) => {
        if (error instanceof AxiosError) throw Error(error.message);
        throw error;
      });

    const instance = axios.create({
      baseURL:
        args?.baseURL ||
        `https://graph.facebook.com/${configs.META_APP_VERSION}`,
      params: {
        access_token: accessToken,
      },
    });

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error instanceof AxiosError) {
          logger.error(error, {
            case: `[Meta App] errored`,
          });
          throw new HttpException(error.response.data, error.response.status);
        } else {
          logger.error(error, {
            case: `[Meta App] errored`,
          });
          throw new HttpException(error.message, 500);
        }
      },
    );

    return instance;
  }

  async setPagesSubscriptions(page: PluginMetaPageEntity) {
    const instance = await this.getPageInstance(page);
    await instance.delete(`/${page.id}/subscribed_apps`).catch(() => null);

    await instance
      .post(`/${page.id}/subscribed_apps`, {
        subscribed_fields: this.subscriptions,
      })
      .catch((error) => {
        logger.error(error, {
          case: `Set Meta Page subscriptions failed`,
          fields: {
            workspaceId: page.workspaceId,
            pageId: page.id,
          },
        });
      });
  }

  // Webhook
  async webhook(body: any) {
    if (IS_DEV) {
      logger.info('Received Meta Page webhook', { fields: body });
    }

    await this.queueProducers.processMetaPagesWebhook(body);
  }

  async processWebhook(body: any) {
    const object = body.object;

    if (object === 'page') {
      for (const entry of body.entry) {
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const messaging of entry.messaging) {
            await this.handleMessage(messaging).catch((error) => {
              logger.error(error, {
                case: `Handle Meta Page message failed`,
              });
            });
          }
        }
      }
    }
  }

  async uploadAttachment(
    instance: PluginMetaPageInstance,
    url: string,
    type: 'image' | 'file',
  ) {
    const res = await instance.post(
      `/${instance.page.id}/message_attachments`,
      {
        message: {
          attachment: {
            type: type,
            payload: {
              url: url,
              is_reusable: false,
            },
          },
        },
      },
    );

    return res.attachment_id;
  }

  getMessageBoxIntegration(pageId: string): MessageBoxIntegration {
    return {
      sendText: async (args) => {
        const instance = await this.getPageInstanceById(pageId);

        const message = await instance.post(`/${pageId}/messages`, {
          recipient: {
            id: args.clientId,
          },
          messaging_type: 'RESPONSE',
          message: {
            text: args.text,
          },
        });

        return message.message_id;
      },
      sendImage: async (args) => {
        const instance = await this.getPageInstanceById(pageId);

        const message = await instance.post(`/${pageId}/messages`, {
          recipient: {
            id: args.clientId,
          },
          messaging_type: 'RESPONSE',
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: renderFileLink(args.url),
              },
            },
          },
        });

        return message.message_id;
      },
      sendFile: async (args) => {
        const instance = await this.getPageInstanceById(pageId);

        const message = await instance.post(`/${pageId}/messages`, {
          recipient: {
            id: args.clientId,
          },
          messaging_type: 'RESPONSE',
          message: {
            attachment: {
              type: 'file',
              payload: {
                url: renderFileLink(args.url),
              },
            },
          },
        });

        return message.message_id;
      },
      getSenderInfo: async (message) => {
        const instance = await this.getPageInstanceById(pageId);
        const messageId = message.message?.mid;
        const result = await instance.get(`/${messageId}`, {
          params: {
            fields: 'id,created_time,from,to,message',
          },
        });

        const picture = await instance
          .get(`/${result.from.id}/picture`, {
            params: {
              redirect: 0,
              type: 'normal',
            },
          })
          .catch(() => ({}));

        return {
          name: result.from.name,
          avatar: picture?.data?.url,
        };
      },
      parseMessage: async (message) => {
        try {
          return {
            messageId: message.message?.mid,
            clientId:
              message.sender?.id !== pageId ? message.sender?.id : undefined,
            text: message.message?.text,
            attachments: message.message?.attachments.map((item: any) => {
              const file = parseFileFromUrl(item.payload.url);
              return {
                type: file.type,
                name: file.fileName,
                extension: file.extension,
                url: item.payload.url,
              };
            }),
          };
        } catch (error) {
          throw Error('Invalid message');
        }
      },
    };
  }

  async triggerForwardWebhookUrls(data: any) {
    // Forward to meta webhook urls
    for (const url of forwardWebhookUrls) {
      this.queueProducers.forwardMetaWebhooks({
        domain: url,
        data,
      });
    }
  }

  async forwardWebhook(dto: ForwardMetaWebhookDto) {
    const { domain, data } = dto;
    await axios.post(`${domain}/plugins/meta-pages/webhook`, data);
  }
}
