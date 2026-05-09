import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { MongoRepository } from 'typeorm';
import { mustBeObjectId, withMongoQuery } from '../database/database.utils';
import { DatabaseName } from '../database/database.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  WithWorkspaceArgs,
  withWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { FileExportEntity } from './entities/file-export.entity';
import { CreateFileExportInput, FileExportStatus } from './file-exports.types';
import { EventDataActionType, EventType } from '../events/events.types';

@Injectable()
export class FileExportsService {
  constructor(
    @InjectRepository(FileExportEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<FileExportEntity>,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async create(
    args: WithWorkspaceArgs<{ input: CreateFileExportInput }>,
  ): Promise<FileExportEntity> {
    const { input, member } = withWorkspaceArgs(args);

    const entity = new FileExportEntity();
    entity.workspaceId = member.workspaceId;
    entity.userId = member.userId;
    entity.contextType = input.contextType;
    entity.contextArgs = input.contextArgs;
    entity.fileName = input.fileName;
    entity.locale = input.locale ?? member.locale ?? undefined;
    entity.status = FileExportStatus.IDLE;
    entity.createdByUserId = member.userId;

    await this.repository.save(entity);

    await this.queueProducers.processFileExport({
      exportId: entity._id.toString(),
      workspaceId: entity.workspaceId,
    });

    this.queueProducers.captureEvent({
      type: EventType.FILE_EXPORT_NEW,
      actionType: EventDataActionType.CREATE,
      ref: entity._id.toString(),
      workspaceId: entity.workspaceId,
      userId: entity.userId,
    });

    return entity;
  }

  async list(
    args: WithWorkspaceArgs<{ query?: any }>,
  ): Promise<{ total: number; results: FileExportEntity[] }> {
    const { workspaceId } = withWorkspaceArgs(args);

    const [results, total] = await this.repository.findAndCount(
      withMongoQuery<FileExportEntity>({
        ...args,
        where: { workspaceId },
        filterFields: ['contextType', 'status'],
      }),
    );

    return { total, results };
  }

  async get(
    args: WithOptionalWorkspaceArgs<{ exportId: string }>,
  ): Promise<FileExportEntity> {
    const { exportId, member } = withOptionalWorkspaceArgs(args);

    const entity = await this.repository.findOne({
      where: { _id: mustBeObjectId(exportId) },
    });

    if (!entity) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ member, data: entity });

    return entity;
  }

  async retry(
    args: WithWorkspaceArgs<{ exportId: string }>,
  ): Promise<FileExportEntity> {
    const entity = await this.get(args);

    entity.status = FileExportStatus.IDLE;
    entity.fileRelativePath = undefined;
    entity.error = undefined;

    await this.repository.save(entity);

    await this.queueProducers.processFileExport({
      exportId: entity._id.toString(),
      workspaceId: entity.workspaceId,
    });

    return entity;
  }

  async delete(args: WithWorkspaceArgs<{ exportId: string }>): Promise<void> {
    const entity = await this.get(args);

    if (entity.fileRelativePath) {
      const filePath = join(
        process.cwd(),
        entity.fileRelativePath.replace(/^\/public/, 'public'),
      );
      if (existsSync(filePath)) await rm(filePath, { force: true });
    }

    await this.repository.deleteOne({ _id: entity._id });
  }

  async updateStatus(args: {
    exportId: string;
    status: FileExportStatus;
    fileUrl?: string;
    error?: string;
  }): Promise<void> {
    const { exportId, status, fileUrl, error } = args;

    const entity = await this.repository.findOne({
      where: { _id: mustBeObjectId(exportId) },
    });

    if (!entity) return;

    entity.status = status;
    if (fileUrl) entity.fileRelativePath = fileUrl;
    if (error) entity.error = error;

    await this.repository.save(entity);

    const eventType =
      status === FileExportStatus.FINISHED
        ? EventType.FILE_EXPORT_FINISHED
        : status === FileExportStatus.FAILED
          ? EventType.FILE_EXPORT_FAILED
          : null;

    if (eventType) {
      this.queueProducers.captureEvent({
        type: eventType,
        actionType: EventDataActionType.UPDATE,
        ref: entity._id.toString(),
        workspaceId: entity.workspaceId,
        userId: entity.userId,
      });
    }
  }

  async getEntityById(exportId: string): Promise<FileExportEntity | null> {
    return this.repository.findOne({
      where: { _id: mustBeObjectId(exportId) },
    });
  }
}
