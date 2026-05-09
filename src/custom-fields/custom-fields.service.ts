import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId, withMongoQuery } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { CustomFieldEntity } from './custom-fields.entity';
import {
  BaseCustomFieldValue,
  CustomFieldInput,
  CustomFieldValue,
} from './custom-fields.types';

@Injectable()
export class CustomFieldsService {
  constructor(
    @InjectRepository(CustomFieldEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<CustomFieldEntity>,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async bindCustomFieldValues(entity: {
    customFieldValues?: BaseCustomFieldValue[];
  }): Promise<CustomFieldValue[]> {
    const output = await Promise.all(
      (entity.customFieldValues || []).map(async (value) => {
        const customField = await this.repository.findOne({
          where: { _id: mustBeObjectId(value.customFieldId) },
        });

        if (!customField) return null;

        return {
          ...value,
          type: customField.type,
          config: customField.config,
          key: customField.key,
        };
      }),
    );

    return output.filter((c) => c !== null);
  }

  async get(args: WithOptionalWorkspaceArgs<{ id: string }>) {
    const { member, workspaceId } = withOptionalWorkspaceArgs(args);
    const customField = await this.repository.findOne({
      where: { _id: mustBeObjectId(args.id), workspaceId },
    });
    if (!customField) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ member, data: customField });
    return customField;
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['label', 'type', 'entities', 'key'],
      }),
    );

    return {
      count: data[1],
      data: data[0],
    };
  }

  async create(args: WithWorkspaceArgs<{ input: CustomFieldInput }>) {
    const { member, input, workspaceId } = withWorkspaceArgs(args);
    const customField = new CustomFieldEntity();
    customField.workspaceId = workspaceId;
    customField.type = input.type;
    customField.label = input.label;
    customField.description = input.description;
    customField.config = input.config;
    customField.entities = input.entities;
    customField.order = input.order ?? customField.order ?? 0;
    customField.key = input.key;
    customField.placeholder = input.placeholder;

    await this.repository.save(customField);

    this.queueProducers.captureEvent({
      type: EventType.CUSTOM_FIELDS_NEW,
      actionType: EventDataActionType.CREATE,
      userId: member?.userId,
      workspaceId: member?.workspaceId,
      ref: customField._id.toString(),
      persist: true,
    });

    return customField;
  }

  async update(
    args: WithWorkspaceArgs<{ id: string; input: CustomFieldInput }>,
  ) {
    const { member, input, id } = withWorkspaceArgs(args);
    const customField = await this.get({ member, id });

    customField.type = input.type;
    customField.label = input.label;
    customField.description = input.description;
    customField.config = input.config;
    customField.entities = input.entities;
    customField.order = input.order ?? customField.order ?? 0;
    customField.key = input.key;
    customField.placeholder = input.placeholder;
    customField.order = input.order ?? customField.order ?? 0;

    await this.repository.save(customField);

    this.queueProducers.captureEvent({
      actionType: EventDataActionType.UPDATE,
      type: EventType.CUSTOM_FIELDS_UPDATED,
      userId: member.userId,
      workspaceId: member.workspaceId,
      ref: customField._id.toString(),
      persist: true,
    });

    return customField;
  }

  async delete(args: WithWorkspaceArgs<{ id: string }>) {
    const { member, id } = withWorkspaceArgs(args);
    const customField = await this.get(args);
    if (!customField) throw new NotFoundException();

    await this.repository.remove(customField);

    this.queueProducers.captureEvent({
      actionType: EventDataActionType.ARCHIVED,
      type: EventType.CUSTOM_FIELDS_REMOVED,
      userId: member?.userId,
      workspaceId: member?.workspaceId,
      ref: id,
      persist: true,
    });
  }
}
