import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { default as Axios, AxiosError } from 'axios';
import { ObjectId } from 'mongodb';
import qs from 'qs';
import { MongoRepository } from 'typeorm';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { configs, IS_DEV } from '../config/config';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId, RawObjectId } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { FilesService } from '../files/files.service';
import { normalizeFileResponse, parseFileFromUrl } from '../files/files.utils';
import { MessageBoxIntegration } from '../message-boxes/message-boxes.integration';
import { MessageBoxesService } from '../message-boxes/message-boxes.service';
import {
  AddMessageToBoxInput,
  MessageBoxPlatformType,
} from '../message-boxes/message-boxes.types';
import {
  MessageAttachment,
  MessageAttachmentType,
  MessageResource,
  MessageType,
} from '../message-boxes/messages.types';
import { PluginMetaMessageType } from '../plugin-meta-pages/plugin-meta-pages.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { cryptoDecrypt, cryptoEncrypt } from '../utils/crypto.util';
import { DateTime } from '../utils/date-time';
import {
  addPhoneNumberCountryCode,
  validatePhoneNumber,
} from '../utils/phone.utils';
import { generatePKCE } from '../utils/pkce.util';
import { wait } from '../utils/wait.utils';
import { WorkspaceSettingsService } from '../workspace-settings/workspace-settings.service';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { PluginZaloOaEntity } from './entities/plugin-zalo-oa.entity';
import { PluginZaloOaInstance } from './plugin-zalo-oas.instance';
import {
  ConnectZaloOaResponse,
  PluginZaloOaSendZnsInput,
  PluginZaloOaStatus,
  UpdatePluginZaloOaInput,
  ZaloOaGmfGroup,
  ZaloOaInfo,
} from './plugin-zalo-oas.types';

@Injectable()
export class PluginZaloOasService {
  constructor(
    @InjectRepository(PluginZaloOaEntity, DatabaseName.MONGO)
    private repository: MongoRepository<PluginZaloOaEntity>,
    @Inject(forwardRef(() => MessageBoxesService))
    private messageBoxes: MessageBoxesService,
    private workspaceSettings: WorkspaceSettingsService,
    private readonly files: FilesService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async getOas(workspaceId: RawObjectId) {
    return this.repository.find({
      where: { workspaceId: mustBeObjectId(workspaceId).toString() },
    });
  }

  async get(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { id, member } = withWorkspaceArgs(args);
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!data) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ data, member });
    return data;
  }

  async bindData(oa: PluginZaloOaEntity) {
    if (!oa.info) {
      oa.info = await this.fetchOaInfo(oa);
      await this.repository.save(oa);
    }

    const { accessToken, refreshToken, ...rest } = oa;
    return rest;
  }

  async update(
    args: WithWorkspaceArgs<{
      id: RawObjectId;
      input: UpdatePluginZaloOaInput;
    }>,
  ) {
    const { member, input } = withWorkspaceArgs(args);

    const oa = await this.get(args);
    oa.znsTemplateIds = input.znsTemplateIds;
    oa.znsTemplateStatues = input.znsTemplateStatues;
    await this.repository.save(oa);

    this.queueProducers.captureEvent({
      type: EventType.PLUGIN_ZALO_OA_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: oa.workspaceId,
      ref: oa._id.toString(),
      userId: member?.userId,
    });

    return oa;
  }

  connectVerifiers: { [workspaceId: string]: string } = {};
  async connect(args: WithWorkspaceArgs): Promise<ConnectZaloOaResponse> {
    const { workspaceId } = withWorkspaceArgs(args);
    const pkce = generatePKCE();
    const search = new URLSearchParams();
    search.append('app_id', configs.ZALO_APP_ID);
    search.append(
      'redirect_uri',
      `${configs.APP_URL}/plugins/zalo-oas/connect-callback`,
    );
    search.append('code_challenge', pkce.challenge);
    this.connectVerifiers[workspaceId] = pkce.verifier;

    return {
      url: `https://oauth.zaloapp.com/v4/oa/permission?${search.toString()}`,
    };
  }

  async connectCallback(args: WithWorkspaceArgs<{ code: string }>) {
    const { code, member, workspaceId } = withWorkspaceArgs(args);

    const payload = {
      code,
      app_id: configs.ZALO_APP_ID,
      grant_type: 'authorization_code',
      code_verifier: this.connectVerifiers[workspaceId],
    };

    const { data: authResponse } = await Axios({
      method: 'POST',
      url: `https://oauth.zaloapp.com/v4/oa/access_token`,
      data: qs.stringify(payload),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: configs.ZALO_APP_SECRET,
      },
    });

    // Error handling
    if (authResponse.error && authResponse.error !== 0) {
      if (
        typeof authResponse === 'object' &&
        authResponse.error_name === 'Authorized code expired'
      ) {
        throw new BadRequestException(AppMessage.AUTHORIZED_CODE_EXPIRED);
      }

      throw new BadRequestException(
        AppMessage.UNKNOW_ERROR_WHEN_CONNECTING_TO_ZALO_OA,
      );
    }

    const oa = new PluginZaloOaEntity();

    oa._id = new ObjectId();
    oa.workspaceId = workspaceId;
    oa.accessToken = cryptoEncrypt(
      { token: authResponse.access_token },
      configs.ENCRYPT_PASSWORD,
    );
    oa.refreshToken = cryptoEncrypt(
      { token: authResponse.refresh_token },
      configs.ENCRYPT_PASSWORD,
    );
    oa.status = PluginZaloOaStatus.ACTIVE;
    oa.isDisabled = false;

    const oaInfo = await this.fetchOaInfo(oa);
    oa.id = oaInfo.oa_id;
    oa.info = oaInfo;

    // Reuse existing Zalo OA if already exists
    await this.repository
      .findOne({ where: { id: oaInfo.oa_id } })
      .then((existed) => {
        if (!existed) return;
        oa._id = existed._id;
        oa.isDefault = existed.isDefault;
      });

    // Auto set default if no other Zalo OA in workspace
    // This is to ensure that there is always a default Zalo OA in workspace
    const oasCount = await this.repository.find({
      where: { workspaceId },
    });
    if (oasCount.length === 0) oa.isDefault = true;

    await this.repository.save(oa);

    this.queueProducers.captureEvent({
      type: EventType.PLUGIN_ZALO_OA_ACTIVE,
      actionType: EventDataActionType.UPDATE,
      workspaceId: oa.workspaceId,
      ref: oa._id.toString(),
      userId: member?.userId,
    });

    delete this.connectVerifiers[workspaceId];

    return oa;
  }

  async healthCheck(oa: PluginZaloOaEntity) {
    const maxRetryTime = 10;

    const process = async (retryTime: number) => {
      try {
        await this.refreshToken(oa);
        oa.info = await this.fetchOaInfo(oa);
        await this.repository.save(oa);
        return oa;
      } catch (error) {
        if (retryTime > maxRetryTime) {
          logger.error(error, {
            case: `[Zalo OA] #${oa.id} health check failed after ${retryTime} retries`,
          });

          this.queueProducers.captureEvent({
            type: EventType.PLUGIN_ZALO_OA_INACTIVE,
            actionType: EventDataActionType.UPDATE,
            workspaceId: oa.workspaceId,
          });

          throw error;
        } else {
          await wait(5000);
          return process(retryTime + 1);
        }
      }
    };

    return process(0);
  }

  async refreshToken(oa: PluginZaloOaEntity) {
    try {
      const payload = {
        refresh_token: cryptoDecrypt(oa.refreshToken, configs.ENCRYPT_PASSWORD)
          ?.token,
        app_id: configs.ZALO_APP_ID,
        grant_type: 'refresh_token',
      };

      const retrieveToken = await Axios({
        method: 'POST',
        url: `https://oauth.zaloapp.com/v4/oa/access_token`,
        data: qs.stringify(payload),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          secret_key: configs.ZALO_APP_SECRET,
        },
      });

      if (retrieveToken.data.error && retrieveToken.data.error < 0) {
        throw new BadRequestException(
          AppMessage.PLUGIN_ZALO_OA_CONNECT_FAILED,
          { cause: retrieveToken.data },
        );
      }

      const currentStatus = oa.status;
      oa.accessToken = cryptoEncrypt(
        { token: retrieveToken.data.access_token },
        configs.ENCRYPT_PASSWORD,
      );
      oa.refreshToken = cryptoEncrypt(
        { token: retrieveToken.data.refresh_token },
        configs.ENCRYPT_PASSWORD,
      );
      oa.status = PluginZaloOaStatus.ACTIVE;

      await this.repository.save(oa);

      if (currentStatus === PluginZaloOaStatus.INACTIVE) {
        this.queueProducers.captureEvent({
          type: EventType.PLUGIN_ZALO_OA_ACTIVE,
          actionType: EventDataActionType.UPDATE,
          workspaceId: oa.workspaceId,
        });
      }

      return oa;
    } catch (error) {
      await this.repository.update(oa._id, {
        status: PluginZaloOaStatus.INACTIVE,
      });

      if (error instanceof HttpException) throw error;
      throw new BadRequestException(AppMessage.PLUGIN_ZALO_OA_CONNECT_FAILED, {
        cause: error,
      });
    }
  }

  async reconnect(_id: any) {
    const oa = await this.get(_id);
    return this.refreshToken(oa);
  }

  async toggleEnable(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { member } = withWorkspaceArgs(args);

    const oa = await this.get(args);
    oa.isDisabled = !!!oa.isDisabled;

    await this.repository.update(oa._id, { isDisabled: oa.isDisabled });

    if (oa.isDisabled) {
      this.queueProducers.captureEvent({
        type: EventType.PLUGIN_ZALO_OA_DISABLED,
        actionType: EventDataActionType.UPDATE,
        workspaceId: oa.workspaceId,
        ref: oa._id.toString(),
        userId: member?.userId,
      });
    } else {
      this.queueProducers.captureEvent({
        type: EventType.PLUGIN_ZALO_OA_ENABLED,
        actionType: EventDataActionType.UPDATE,
        workspaceId: oa.workspaceId,
        ref: oa._id.toString(),
        userId: member?.userId,
      });
    }

    return oa;
  }

  async remove(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { member } = withWorkspaceArgs(args);
    const oa = await this.get(args);

    await this.repository.delete(oa._id);

    this.queueProducers.captureEvent({
      type: EventType.PLUGIN_ZALO_OA_REMOVED,
      actionType: EventDataActionType.ARCHIVED,
      ref: oa._id.toString(),
      userId: member?.userId,
      workspaceId: oa.workspaceId,
    });
    return true;
  }

  async getInstance(
    oa: PluginZaloOaEntity,
    args?: { version?: string; baseUrl?: string },
  ) {
    return new PluginZaloOaInstance(oa, this.repository, args);
  }

  async fetchOaInfo(oa: PluginZaloOaEntity): Promise<ZaloOaInfo> {
    const instance = await this.getInstance(oa, { version: 'v2.0' });
    const { data } = await instance.get(`/oa/getoa`);
    return data;
  }

  async getInstanceById(
    oaId: string,
    args?: {
      version?: string;
      baseUrl?: string;
    },
  ) {
    const oa = await this.repository.findOne({ where: { id: oaId } });
    if (!oa) throw new BadRequestException(AppMessage.PLUGIN_ZALO_UNAVAILABLE);
    return this.getInstance(oa, args);
  }

  async getUserInfo(plugIn: PluginZaloOaEntity, userId: string) {
    try {
      const axios = await this.getInstance(plugIn);
      const response = await axios.get(
        `/oa/user/detail?data={"user_id":"${userId}"}`,
      );

      return {
        name: response.data.display_name,
        avatar: response.data.avatar,
        phone: response.data.shared_info?.phone
          ? validatePhoneNumber(response.data.shared_info?.phone, false)
          : null,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error(error.response?.data, {
          case: `PluginZaloService.getUserInfo > userId: ${userId}`,
        });
      } else {
        logger.error(error, {
          case: `PluginZaloService.getUserInfo > userId: ${userId}`,
        });
      }
      throw error;
    }
  }

  async getByOaId(
    args: WithOptionalWorkspaceArgs<{ oaId: string }>,
  ): Promise<PluginZaloOaEntity | undefined> {
    const { oaId, member } = withOptionalWorkspaceArgs(args);
    const oa = await this.repository.findOne({ where: { id: oaId } });
    if (!oa) throw new BadRequestException(AppMessage.PLUGIN_ZALO_UNAVAILABLE);
    if (member) validateWorkspaceAccessable({ data: oa, member });
    return oa;
  }

  async getOaGmfGroups(
    args: WithWorkspaceArgs<{ offset?: number; limit?: number }>,
  ): Promise<ZaloOaGmfGroup[]> {
    const { workspaceId } = withWorkspaceArgs(args);
    const settings = await this.workspaceSettings.get(workspaceId);

    const defaultOa = await this.repository.findOne({
      where: { workspaceId, isDefault: true },
    });

    if (!defaultOa) return [];

    const instance = await this.getInstance(defaultOa);
    const response = await instance.get(`/oa/group/getgroupsofoa`, {
      params: {
        offset: Number(args.offset || 0),
        count: Number(args.limit || 5),
      },
    });
    const { groups } = response.data;

    return groups.map((item: ZaloOaGmfGroup) => ({
      id: item.group_id,
      ...item,
      ...settings.zaloOaGmfGroupSettings?.[item.group_id],
    }));
  }

  async setDefault(args: WithWorkspaceArgs<{ id: string }>) {
    const { member, id, workspaceId } = withWorkspaceArgs(args);
    const oa = await this.get(args);
    const workspaceOas = await this.repository.find({
      where: { workspaceId },
    });

    for (let i = 0; i < workspaceOas.length; i++) {
      const item = workspaceOas[i];
      if (item._id.toString() === id) {
        item.isDefault = true;
      } else {
        item.isDefault = false;
      }
      await this.repository.update(item._id, { isDefault: item.isDefault });
    }

    oa.isDefault = true;

    this.queueProducers.captureEvent({
      type: EventType.PLUGIN_ZALO_OA_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: oa.workspaceId,
      ref: oa._id.toString(),
      userId: member?.userId,
    });

    return oa;
  }

  async sendZNS(
    args: WithWorkspaceArgs<{ input: PluginZaloOaSendZnsInput }>,
  ): Promise<boolean> {
    const { workspaceId, input } = withWorkspaceArgs(args);

    const oa = await this.repository.findOne({
      where: { workspaceId, isDefault: true },
    });
    const templateId = oa.znsTemplateIds?.[input.templateId];
    const templateStatus = oa.znsTemplateStatues?.[input.templateId];
    const isTemplateActive =
      typeof templateStatus === 'undefined' || templateStatus === true;

    if (oa.isDisabled || !templateId || !isTemplateActive) return false;

    const instance = await this.getInstance(oa, {
      baseUrl: 'https://business.openapi.zalo.me',
    });

    const phoneNumber = validatePhoneNumber(input.phoneNumber, true);

    await instance.post('/message/template', {
      mode: input.isTesting ? 'development' : 'production',
      phone: addPhoneNumberCountryCode(phoneNumber, '84'),
      template_id: templateId,
      template_data: input.data,
      tracking_id: input.code,
    });

    return true;
  }

  async sendGmfGroupMessage(
    args: WithWorkspaceArgs<{ message: string; groupId?: string }>,
  ) {
    const { workspaceId } = withWorkspaceArgs(args);
    const settings = await this.workspaceSettings.get(workspaceId);

    const defaultOa = await this.repository.findOne({
      where: { workspaceId, isDefault: true },
    });
    if (!defaultOa)
      throw new BadRequestException(AppMessage.PLUGIN_ZALO_NO_DEFAULT_OA);
    if (defaultOa.isDisabled || defaultOa.isArchived)
      return { status: 'Unavailable' };

    const instance = await this.getInstance(defaultOa);

    if (args.groupId) {
      throw new BadRequestException('Group ID is not supported');
    } else {
      const adminGroupIds = Object.keys(
        settings.zaloOaGmfGroupSettings || {},
      ).filter(
        (item) =>
          settings.zaloOaGmfGroupSettings?.[item]?.isAdminNotificationEnabled,
      );

      for (const groupId of adminGroupIds) {
        await instance.post(`/oa/group/message`, {
          recipient: {
            group_id: groupId,
          },
          message: {
            text: args.message,
          },
        });
      }
    }
  }

  async webhook(body: Record<string, unknown>) {
    if (IS_DEV) {
      logger.info('Received Zalo webhook', { fields: body });
    }

    await this.queueProducers.processZaloOaWebhook(body);

    return {
      captured: true,
    };
  }

  async processWebhook(body: Record<string, unknown>) {
    const isReceiveMessage = body.sender && body.recipient;
    if (isReceiveMessage) await this.onReceiveMessage(body);
  }

  detectType(message: any) {
    const messageEvents = [
      'user_send_text',
      'user_send_image',
      'user_send_sticker',
      'user_send_gif',
      'user_send_location',
      'user_send_audio',
      'user_send_video',
      'user_send_file',

      'oa_send_text',
      'oa_send_image',
      'oa_send_sticker',
      'oa_send_gif',
      'oa_send_list',
      'oa_send_file',
    ];

    if (messageEvents.includes(message.event_name))
      return PluginMetaMessageType.MESSAGE;

    if (['user_seen_message'].includes(message.event_name))
      return PluginMetaMessageType.READED;

    if (['user_received_message'].includes(message.event_name))
      return PluginMetaMessageType.MESSAGE_DELIVERY;

    if (IS_DEV) {
      logger.warn('Unknown message type', {
        fields: message,
      });
    }
  }

  async convertMessage(
    message: any,
    oa: PluginZaloOaEntity,
  ): Promise<
    Pick<AddMessageToBoxInput, 'id' | 'text' | 'attachments' | 'createdAt'>
  > {
    const attachments: MessageAttachment[] = [];

    if (
      message.message?.attachments &&
      Array.isArray(message.message?.attachments)
    ) {
      for (const item of message.message?.attachments) {
        if (item.payload.sticker_id) {
          attachments.push({
            type: MessageAttachmentType.STICKER,
            url: item.payload.url,
          });
        } else {
          const file = await this.files
            .addExternalFile({
              workspaceId: oa.workspaceId,
              url: item.payload.url,
            })
            .then(normalizeFileResponse);

          attachments.push({
            type: MessageAttachmentType.IMAGE,
            url: file.path,
          });
        }
      }
    }

    return {
      id: message.message.msg_id,
      text: message.message?.text,
      attachments,
      createdAt: DateTime.toSeconds(message.timestamp),
    };
  }

  async onReceiveMessage(message: any) {
    const senderId = message.sender?.id;
    const receipientId = message.recipient?.id;

    const emitOA: PluginZaloOaEntity | undefined = senderId
      ? await this.getByOaId({ oaId: senderId }).catch(() => undefined)
      : undefined;

    const onOA: PluginZaloOaEntity | undefined = receipientId
      ? await this.getByOaId({ oaId: receipientId }).catch(() => undefined)
      : undefined;

    // OA send message
    if (emitOA) {
      const type = this.detectType(message);
      if (type === PluginMetaMessageType.MESSAGE) {
        const msg = await this.convertMessage(message, emitOA);

        await this.messageBoxes.addMessage({
          ...msg,
          type: MessageType.SEND,
          platformType: MessageBoxPlatformType.ZALO,
          platformId: emitOA.id,
          workspaceId: emitOA.workspaceId,
          senderId: receipientId,
          resource: MessageResource.WEBHOOK,
        });
      }
    }

    // Page receive message
    if (onOA) {
      const type = this.detectType(message);
      if (type === PluginMetaMessageType.MESSAGE) {
        const msg = await this.convertMessage(message, onOA);

        await this.messageBoxes.addMessage({
          ...msg,
          type: MessageType.RECEIVE,
          platformType: MessageBoxPlatformType.ZALO,
          platformId: onOA.id,
          workspaceId: onOA.workspaceId,
          senderId: senderId,
          getSenderInfo: async () => this.getUserInfo(onOA, senderId),
          resource: MessageResource.WEBHOOK,
        });
      }

      if (type === PluginMetaMessageType.READED) {
        // TODO: Handle readed message
      }
    }
  }

  getMessageBoxIntegration(oaId: string): MessageBoxIntegration {
    return {
      sendText: async (args) => {
        const instance = await this.getInstanceById(oaId);

        const response = await instance.post(`/oa/message/cs`, {
          recipient: { user_id: args.clientId },
          message: { text: args.text },
        });

        return response.data.message_id;
      },
      sendImage: async (args) => {
        const instance = await this.getInstanceById(oaId);

        const response = await instance.post(`/oa/message/cs`, {
          recipient: { user_id: args.clientId },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'media',
                elements: [{ media_type: 'image', url: args.url }],
              },
            },
          },
        });

        return response.data.message_id;
      },
      sendFile: async (args) => {
        const tempFile = await this.files.retreiveTempFile(args.url);

        const instanceV2 = await this.getInstanceById(oaId, {
          version: 'v2.0',
        });
        const form = new FormData();

        // @ts-ignore
        form.append('file', new File([tempFile.file], tempFile.fileName));

        const attachment = await instanceV2.postFormData(
          '/oa/upload/file',
          form,
        );
        const instance = await this.getInstanceById(oaId);
        const response = await instance.post(`/oa/message/cs`, {
          recipient: { user_id: args.clientId },
          message: {
            attachment: {
              type: 'file',
              payload: {
                token: attachment.data.token,
              },
            },
          },
        });

        return response.data.message_id as string;
      },
      getSenderInfo: async (message) => {
        const senderId = message.sender?.id;
        const instance = await this.getInstanceById(oaId);
        const response = await instance.get(
          `/oa/user/detail?data={"user_id":"${senderId}"}`,
        );

        return {
          name: response.data.display_name,
          avatar: response.data.avatar,
          phone: response.data.shared_info?.phone
            ? validatePhoneNumber(response.data.shared_info?.phone, false)
            : null,
        };
      },
      parseMessage: async (message) => {
        try {
          return {
            messageId: message.message?.msg_id,
            text: message.message?.text,
            clientId:
              message.sender?.id !== oaId ? message.sender?.id : undefined,
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

  async getAccountPhoneFromToken(args: {
    workspaceId: string;
    token: string;
    accessToken: string;
  }) {
    const oa = await this.repository.findOne({
      where: { workspaceId: args.workspaceId, isDefault: true },
    });

    if (!oa) {
      throw new BadRequestException(AppMessage.PLUGIN_ZALO_UNAVAILABLE);
    }

    const instance = await this.getInstance(oa, {
      baseUrl: 'https://graph.zalo.me/v2.0',
    });

    const response = await instance.get<{ data: { number?: string } }>(
      `/me/info`,
      {
        headers: {
          secret_key: configs.ZALO_APP_SECRET,
          code: args.token,
          access_token: args.accessToken,
        },
      },
    );

    if (!response.data?.number) {
      throw new BadRequestException(AppMessage.MISSING_ZALO_OA_INFO);
    }

    return validatePhoneNumber(response.data?.number?.trim(), false);
  }
}
