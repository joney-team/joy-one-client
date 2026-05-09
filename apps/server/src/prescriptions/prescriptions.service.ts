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
import { DateTime } from '../utils/date-time';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { PrescriptionEntity } from './entities/prescription.entity';
import { PrescriptionInput } from './prescriptions.types';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(PrescriptionEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<PrescriptionEntity>,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async get(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { member, id } = withWorkspaceArgs(args);
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!data) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ member, data });
    return data;
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(withMongoQuery(args));

    return {
      total: data[1],
      results: data[0],
    };
  }

  async create(args: WithWorkspaceArgs<{ input: PrescriptionInput }>) {
    const { workspaceId, member, input } = withWorkspaceArgs(args);

    const prescription = new PrescriptionEntity();
    prescription.workspaceId = workspaceId;
    prescription.name = input.name;
    prescription.items = input.items.filter((v) => v.name && v.name.length > 0);
    prescription.note = input.note;

    await this.repository.save(prescription);

    this.queueProducers.captureEvent({
      ref: prescription._id.toString(),
      type: EventType.PRESCRIPTIONS_NEW,
      actionType: EventDataActionType.CREATE,
      workspaceId: workspaceId,
      userId: member?.userId,
      relatedEntities: [
        {
          entity: AppEntity.PRESCRIPTIONS,
          id: prescription._id.toString(),
          index: true,
        },
      ],
    });

    return prescription;
  }

  async update(
    args: WithWorkspaceArgs<{ id: RawObjectId; input: PrescriptionInput }>,
  ) {
    const { input, member } = withWorkspaceArgs(args);
    const prescription = await this.get(args);

    prescription.name = input.name;
    prescription.items = input.items.filter((v) => v.name && v.name.length > 0);
    prescription.note = input.note;
    await this.repository.save(prescription);

    this.queueProducers.captureEvent({
      ref: prescription._id.toString(),
      type: EventType.PRESCRIPTIONS_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: prescription.workspaceId,
      userId: member?.userId,
      relatedEntities: [
        {
          entity: AppEntity.PRESCRIPTIONS,
          id: prescription._id.toString(),
          index: true,
        },
      ],
    });

    return prescription;
  }

  async remove(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { id, member } = withWorkspaceArgs(args);
    const category = await this.get(args);

    await this.repository.remove(category);

    this.queueProducers.captureEvent({
      ref: category._id.toString(),
      type: EventType.PRESCRIPTIONS_REMOVED,
      actionType: EventDataActionType.ARCHIVED,
      workspaceId: category.workspaceId,
      userId: member?.userId,
      relatedEntities: [
        { entity: AppEntity.PRESCRIPTIONS, id: id.toString(), index: true },
      ],
    });

    return category;
  }

  async updateLastInteractionAt(id: string, time?: number) {
    const _time = time ?? DateTime.getNowInSeconds();
    await this.repository.update(mustBeObjectId(id), {
      lastInteractionAt: _time,
    });
    return { _id: id, _time };
  }
}
