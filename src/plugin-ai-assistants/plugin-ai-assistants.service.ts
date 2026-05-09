import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { splitTextIntoChunks } from 'src/utils/string.utils';
import { MongoRepository } from 'typeorm';
import { logger } from '../app.logger';
import { configs } from '../config/config';
import { DatabaseName } from '../database/database.types';
import {
  mustBeObjectId,
  RawObjectId,
  withMongoQuery,
} from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { MessageBoxesService } from '../message-boxes/message-boxes.service';
import { MessagesService } from '../message-boxes/messages.service';
import { MessageResource, MessageType } from '../message-boxes/messages.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { cryptoEncrypt } from '../utils/crypto.util';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { PluginAiAssistantEntity } from './entities/plugin-ai-assistant.entity';
import { PluginAiAssistantInstance } from './plugin-ai-assistants.instance';
import {
  CreatePluginAiAssistantInput,
  PluginAiAssistantResponseMessageBoxInput,
  PluginAiAssistantStatus,
  UpdatePluginAiAssistantInput,
} from './plugin-ai-assistants.types';

@Injectable()
export class PluginAiAssistantsService {
  constructor(
    @InjectRepository(PluginAiAssistantEntity, DatabaseName.MONGO)
    private repository: MongoRepository<PluginAiAssistantEntity>,
    private readonly messageBoxes: MessageBoxesService,
    private readonly messages: MessagesService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async bindData(assistant: PluginAiAssistantEntity) {
    let data = { ...assistant };

    delete data.apiKey;
    return data;
  }

  async syncInfo(plugin: PluginAiAssistantEntity) {
    const instance = this.getInstance(plugin);
    const info = await instance.info();

    const isNeedSync = plugin.providerName !== info.name;

    if (isNeedSync) {
      plugin.providerName = info.name;
      await this.repository.save(plugin);
      this.queueProducers.captureEvent({
        ref: plugin._id.toString(),
        workspaceId: plugin.workspaceId,
        actionType: EventDataActionType.UPDATE,
        type: EventType.PLUGIN_AI_ASSISTANTS_UPDATED,
        data: { _id: plugin._id.toString() },
      });
    }
  }

  async create(
    args: WithWorkspaceArgs<{ input: CreatePluginAiAssistantInput }>,
  ) {
    const { input, member, workspaceId } = withWorkspaceArgs(args);
    const assistant = new PluginAiAssistantEntity();
    assistant.provider = input.provider;
    assistant.workspaceId = workspaceId;
    assistant.enabled = true;
    assistant.status = PluginAiAssistantStatus.ACTIVE;
    assistant.apiKey = cryptoEncrypt(
      {
        apiKey: input.apiKey,
      },
      configs.ENCRYPT_PASSWORD,
    );

    const instance = this.getInstance(assistant);
    const info = await instance.info();
    assistant.providerName = info.name;

    await this.repository.save(assistant);

    this.queueProducers.captureEvent({
      workspaceId: workspaceId,
      actionType: EventDataActionType.CREATE,
      type: EventType.PLUGIN_AI_ASSISTANTS_NEW,
      userId: member?.userId,
      data: { _id: assistant._id.toString() },
    });

    return assistant;
  }

  async get(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { id, member } = withWorkspaceArgs(args);
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!data) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ member, data });
    return data;
  }

  async update(
    args: WithWorkspaceArgs<{
      id: RawObjectId;
      input: UpdatePluginAiAssistantInput;
    }>,
  ) {
    const { input, member } = withWorkspaceArgs(args);
    const assistant = await this.get(args);

    assistant.enabled = input.enabled;

    if (input.provider) {
      assistant.provider = input.provider;
      assistant.apiKey = cryptoEncrypt(
        {
          apiKey: input.apiKey,
        },
        configs.ENCRYPT_PASSWORD,
      );

      const instance = this.getInstance(assistant);
      const info = await instance.info();
      assistant.providerName = info.name;
    }

    await this.repository.save(assistant);

    this.queueProducers.captureEvent({
      ref: assistant._id.toString(),
      workspaceId: assistant.workspaceId,
      actionType: EventDataActionType.UPDATE,
      type: EventType.PLUGIN_AI_ASSISTANTS_UPDATED,
      userId: member?.userId,
      data: { _id: assistant._id.toString() },
    });

    return assistant;
  }

  async delete(args: WithWorkspaceArgs<{ id: string }>) {
    const { member } = withWorkspaceArgs(args);
    const assistant = await this.get(args);

    await this.repository.delete(assistant._id);

    this.queueProducers.captureEvent({
      ref: assistant._id.toString(),
      workspaceId: assistant.workspaceId,
      actionType: EventDataActionType.ARCHIVED,
      type: EventType.PLUGIN_AI_ASSISTANTS_REMOVED,
      userId: member?.userId,
      data: { _id: assistant._id.toString() },
    });
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const result = await this.repository.findAndCount(withMongoQuery(args));

    await Promise.all(
      result[0].map(async (plugin) => {
        this.syncInfo(plugin);
      }),
    );

    return {
      total: result[1],
      results: result[0],
    };
  }

  getInstance(plugin: PluginAiAssistantEntity) {
    return new PluginAiAssistantInstance(plugin);
  }

  async responseMessageBox(input: PluginAiAssistantResponseMessageBoxInput) {
    try {
      const messageBox = await this.messageBoxes.get({
        id: input.messageBoxId,
        workspaceId: input.workspaceId,
      });

      const plugin = await this.repository.findOne({
        where: {
          workspaceId: messageBox.workspaceId,
          status: PluginAiAssistantStatus.ACTIVE,
        },
      });

      if (!plugin || !plugin.enabled || messageBox.aiAssistantDisabled) return;

      const messages = await this.messages.list({
        query: {
          boxId: messageBox._id.toString(),
          limit: 1,
        },
        workspaceId: messageBox.workspaceId,
      });

      const latestMessage = messages.results[0];

      const isAbleToResponse =
        latestMessage &&
        latestMessage.text &&
        latestMessage.type === MessageType.RECEIVE &&
        latestMessage.resource !== MessageResource.AI_ASSISTANT;

      if (!isAbleToResponse) return;

      const instance = this.getInstance(plugin);
      const response = await instance.responseMessage({
        conversation_id: messageBox.aiAssistantconversationId,
        message: latestMessage.text,
        user: messageBox._id.toString(),
      });

      const chunks = splitTextIntoChunks(response.answer);

      for (const chunk of chunks) {
        await this.messageBoxes
          .sendText({
            workspaceId: messageBox.workspaceId,
            boxId: input.messageBoxId,
            input: {
              text: chunk,
              resouce: MessageResource.AI_ASSISTANT,
              aiAssistantMessageId: response.message_id,
            },
          })
          .catch((error) => {
            logger.error(error, {
              case: `Failed to send response from AI to message box`,
            });
          });
      }

      return response;
    } catch (error) {
      logger.error(error, {
        case: `Failed to send response from AI to message box`,
      });
    }
  }
}
