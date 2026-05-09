import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { BookingsService } from '../bookings/bookings.service';
import { CustomersService } from '../customers/customers.service';
import { DatabaseName } from '../database/database.types';
import {
  bindData,
  mustBeObjectId,
  withMongoQuery,
} from '../database/database.utils';
import { EventChannel, EventType } from '../events/events.types';
import { FilesService } from '../files/files.service';
import { OrdersService } from '../orders/orders.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { ObjectUtils } from '../utils/object.utils';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WithOptionalWorkspaceArgs } from '../workspaces/workspaces.utils';
import { WorkspaceStatsEntity } from './entities/workspace-stat.entity';
import { PluginMetaPagesService } from 'src/plugin-meta-pages/plugin-meta-pages.service';
import { PluginMessageHubsService } from 'src/plugin-message-hubs/plugin-message-hubs.service';
import { PluginZaloOasService } from 'src/plugin-zalo-oas/plugin-zalo-oas.service';

@Injectable()
export class WorkspaceStatsService {
  constructor(
    @InjectRepository(WorkspaceStatsEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<WorkspaceStatsEntity>,
    private readonly files: FilesService,
    private readonly customers: CustomersService,
    private readonly bookings: BookingsService,
    private readonly orders: OrdersService,
    private readonly workspaces: WorkspacesService,
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly queueProducers: QueueProducersService,
    private readonly pluginMetaPages: PluginMetaPagesService,
    private readonly pluginZaloOAs: PluginZaloOasService,
    private readonly pluginMessageHubs: PluginMessageHubsService,
  ) {}

  async get(workspaceId: string) {
    const stats = await this.repository.findOne({
      where: { workspaceId: mustBeObjectId(workspaceId).toString() },
    });
    if (!stats) return this.aggregate(workspaceId);
    return stats;
  }

  async aggregate(workspaceId: string) {
    const stat =
      (await this.repository.findOne({
        where: { workspaceId: mustBeObjectId(workspaceId).toString() },
      })) || new WorkspaceStatsEntity();

    stat.workspaceId = mustBeObjectId(workspaceId).toString();
    stat.storageUsage = await this.files
      .getWorkspaceCapacity(workspaceId)
      .then((r) => r.totalSizeInBytes)
      .catch(() => stat.storageUsage || 0);
    stat.members = await this.workspaceMembers
      .getTotalMembers(workspaceId)
      .catch(() => stat.members || 0);
    stat.bookings = await this.bookings
      .list({ workspaceId, select: ['_id'] })
      .then((r) => r.total)
      .catch(() => stat.bookings || 0);
    stat.customers = await this.customers
      .list({ workspaceId, select: ['_id'] })
      .then((r) => r.total)
      .catch(() => stat.customers || 0);
    stat.orders = await this.orders
      .list({ workspaceId, select: ['id'] })
      .then((r) => r.total)
      .catch(() => stat.orders || 0);
    stat.metaPages = await this.pluginMetaPages
      .getPages({ workspaceId })
      .then((r) => r.length)
      .catch(() => stat.metaPages || 0);
    stat.zaloOas = await this.pluginZaloOAs
      .getOas(workspaceId)
      .then((r) => r.length)
      .catch(() => stat.zaloOas || 0);
    stat.messageHubs = await this.pluginMessageHubs
      .getChannels(workspaceId)
      .then((r) => r.length)
      .catch(() => stat.messageHubs || 0);

    await this.repository.save(stat);

    this.queueProducers.captureEvent({
      workspaceId,
      type: EventType.WORKSPACE_STATS_UPDATED,
      channel: EventChannel.WORKSPACE,
    });

    return stat;
  }

  async list(args: WithOptionalWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        sortFields: ['bookings', 'members', 'storageUsage', 'customers'],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async bindData(stats: WorkspaceStatsEntity) {
    return bindData({
      entity: stats,
      extends: {
        workspace: async (data) => {
          const workspaceInfo = await this.workspaces.get(data.workspaceId);
          return ObjectUtils.selects(workspaceInfo, [
            '_id',
            'name',
            'logo',
            'type',
          ]);
        },
      },
    });
  }
}
