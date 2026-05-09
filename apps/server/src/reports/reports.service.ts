import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueueEvents } from 'bullmq';
import EventEmitter from 'events';
import { MongoBulkWriteError } from 'mongodb';
import { Period } from 'src/app.types';
import { BookingsService } from 'src/bookings/bookings.service';
import { CustomersService } from 'src/customers/customers.service';
import { MongoRepository } from 'typeorm';
import { logger } from '../app.logger';
import { IS_TESTING } from '../config/config';
import { DatabaseName } from '../database/database.types';
import {
  bindData,
  mustBeObjectId,
  RawObjectId,
} from '../database/database.utils';
import {
  EventChannel,
  EventDataActionType,
  EventType,
} from '../events/events.types';
import { LoansService } from '../loans/loans.service';
import { OrdersService } from '../orders/orders.service';
import { QueueName } from '../queue-consumers/queue-consumers.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { TasksService } from '../tasks/tasks.service';
import { DateTime } from '../utils/date-time';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { ReportEntity } from './entities/report.entity';
import {
  CombineMetricsReport,
  CombineTimeSeriesReport,
  ExportReportByRangeTimeInput,
  ExportTimeSeriesReportInput,
  ReportStatus,
  ReportType,
  SyncReportInput,
  SyncWorkspaceReportsInput,
} from './reports.types';

const REPORT_VERSION = 'v3.0';

@Injectable()
export class ReportsService {
  exportTimeSeriesReportQueueEvents: QueueEvents;

  constructor(
    @InjectRepository(ReportEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<ReportEntity<any>>,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly customers: CustomersService,
    private readonly bookings: BookingsService,
    private readonly receipts: ReceiptsService,
    private readonly tasks: TasksService,
    private readonly loans: LoansService,
    private readonly orders: OrdersService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async get(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { id, member } = withWorkspaceArgs(args);
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!data) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ member, data });
    return data;
  }

  getTimeSeriesRef(input: ExportReportByRangeTimeInput) {
    const ignoreKeys: (keyof ExportReportByRangeTimeInput)[] = ['forceUpdate'];
    const normalizeInput = Object.keys(input).reduce((acc, key) => {
      if (
        input[key] !== undefined &&
        !ignoreKeys.includes(key as keyof ExportReportByRangeTimeInput)
      )
        acc[key] = input[key];
      return acc;
    }, {});
    return `reports:time-series:${Object.entries(normalizeInput)
      .map(([k, v]) => `${k}:${v}`)
      .join('-')}:${REPORT_VERSION}`
      .toString()
      .toLowerCase();
  }

  async exportTimeSeries(
    args: ExportReportByRangeTimeInput,
  ): Promise<ReportEntity<CombineTimeSeriesReport>> {
    const { forceUpdate, ...input } = args;
    const reportRef = this.getTimeSeriesRef(input);

    const entity: ReportEntity<CombineTimeSeriesReport> =
      (await this.repository.findOne({ where: { ref: reportRef } })) ||
      new ReportEntity();

    if (!!entity._id && !forceUpdate) return entity;

    const [bookings, customers, receipts, tasks, loans] = await Promise.all([
      this.bookings.timeSeriesReport(input),
      this.customers.timeSeriesReport(input),
      this.receipts.timeSeriesReport(input),
      this.tasks.timeSeriesReport(input),
      this.loans.timeSeriesReport(input),
    ]);

    const reportData: CombineTimeSeriesReport = {
      fromTime: input.fromTime,
      toTime: input.toTime,
      bookings,
      customers,
      receipts,
      tasks,
      loans,
    };

    const isUpdate =
      !!entity._id &&
      JSON.stringify(reportData) !== JSON.stringify(entity.data);

    entity.type = ReportType.TIME_SERIES;
    entity.ref = reportRef;
    entity.workspaceId = input.workspaceId;
    entity.workspaceBranchIds = input.workspaceBranchIds;
    entity.userId = input.userId;
    entity.data = reportData;
    entity.dto = input;
    entity.status = !!entity._id
      ? ReportStatus.SYNCED
      : ReportStatus.JUST_CREATED;
    entity.fromTime = input.fromTime;
    entity.toTime = input.toTime;

    await this.repository.save(entity).catch(async (error) => {
      if (error instanceof MongoBulkWriteError && error.code === 11000) {
        const report = await this.repository.findOne({
          where: { ref: reportRef },
        });
        if (report) return report;
      }

      throw error;
    });

    if (isUpdate) {
      this.queueProducers.captureEvent({
        ref: entity._id.toString(),
        type: EventType.REPORT_TIME_SERIES_SYNCED,
        actionType: EventDataActionType.UPDATE,
        workspaceId: input.workspaceId,
        data: entity,
      });
    }

    return entity;
  }

  async processExportTimeSeries(
    args: ExportReportByRangeTimeInput,
    priority = 0,
  ): Promise<ReportEntity<CombineTimeSeriesReport>> {
    if (!args.fromTime || !args.toTime)
      throw new BadRequestException('Invalid time range');

    try {
      const job = await this.queueProducers.exportTimeSeriesReport(
        args,
        priority,
      );
      const result = await job.waitUntilFinished(
        this.exportTimeSeriesReportQueueEvents,
        1000 * 60 * 15,
      );
      return result;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  getRestrictWorkspaceBranchIds(
    input: Pick<ExportReportByRangeTimeInput, 'workspaceBranchIds'>,
    member: WorkspaceMember,
  ) {
    if (
      !member ||
      member.permissions.includes(
        WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS,
      ) ||
      typeof member.workspace.branches !== 'number' ||
      member.workspace.branches === 0
    ) {
      return input.workspaceBranchIds || undefined;
    }

    if (input.workspaceBranchIds) {
      const filterByWorkspaceBranchIds = input.workspaceBranchIds.filter((v) =>
        member.workspaceBranches.some((b) => b._id.toString() === v),
      );
      if (filterByWorkspaceBranchIds.length > 0)
        return filterByWorkspaceBranchIds;
    }

    return member.workspaceBranches.map((b) => b._id.toString());
  }

  getTimeSeriesByPeriod(input: {
    fromTime: number;
    toTime: number;
    period: Period;
  }) {
    const { fromTime, toTime } = input;
    const ranges: { fromTime: number; toTime: number }[] = [];

    const process = (time: number) => {
      if (time > toTime) return;

      const rangeTime = DateTime.getRange(time, input.period);

      const rangeTimeArgs: { fromTime: number; toTime: number } = {
        fromTime: DateTime.toSeconds(rangeTime.start),
        toTime: DateTime.toSeconds(rangeTime.end),
      };

      ranges.push(rangeTimeArgs);
      return process(DateTime.toSeconds(rangeTime.end) + 1000);
    };

    process(fromTime);

    return ranges;
  }

  async getTimeSeries(args: {
    input: ExportTimeSeriesReportInput;
    member: WorkspaceMember;
  }) {
    const { input: dto, member } = args;
    const workspaceBranchIds = this.getRestrictWorkspaceBranchIds(dto, member);

    const { start: fromTime } = DateTime.getRange(dto.fromTime, 'day');
    const { end: toTime } = DateTime.getRange(dto.toTime, 'day');

    const ranges = this.getTimeSeriesByPeriod({
      fromTime: DateTime.toSeconds(fromTime),
      toTime: DateTime.toSeconds(toTime),
      period: dto.period,
    });

    const output = await Promise.all(
      ranges.map(async (range) => {
        const existed = await this.repository.findOne({
          where: {
            ref: this.getTimeSeriesRef({
              ...range,
              workspaceBranchIds,
              workspaceId: member.workspaceId,
              userId: dto.userId,
            }),
          },
        });
        if (!!existed && !dto.forceUpdate) return existed;
        return this.processExportTimeSeries(
          {
            ...range,
            workspaceBranchIds,
            workspaceId: member.workspaceId,
            userId: dto.userId,
          },
          100,
        );
      }),
    );

    return {
      total: output.length,
      results: output,
    };
  }

  getMetricsReportRef(member: WorkspaceMember) {
    const metadata = [
      'reports',
      'metrics',
      member.workspace._id.toString(),
      member.memberId || 'quest',
      member.userId || 'WS',
      member.workspaceBranches.map((b) => b._id.toString()).join('-') || 'ABR',
      REPORT_VERSION,
    ];

    return metadata.join(':').toString().toLowerCase();
  }

  async getMetrics(member: WorkspaceMember, forceUpdate = false) {
    const reportRef = this.getMetricsReportRef(member);

    const entity: ReportEntity<CombineMetricsReport> =
      (await this.repository.findOne({ where: { ref: reportRef } })) ||
      new ReportEntity<CombineMetricsReport>();

    const isNeedToForceUpdate =
      forceUpdate ||
      !entity.updatedAt ||
      new Date(entity.updatedAt * 1000).getDate() !== new Date().getDate();

    if (!!entity.data && !isNeedToForceUpdate) return entity;

    const reportData = await bindData<CombineMetricsReport>({
      entity: {},
      extends: {
        loans: () => this.loans.metricsReport(member),
        tasks: () => this.tasks.metricsReport(member),
        receipts: () => this.receipts.metricsReport(member),
        customers: () => this.customers.metricsReport(member),
        bookings: () => this.bookings.metricsReport(member),
        orders: () => this.orders.metricsReport(member),
      },
    });

    const isSynced =
      !!entity._id &&
      JSON.stringify(reportData) !== JSON.stringify(entity.data);

    entity.type = ReportType.METRICS;
    entity.ref = reportRef;
    entity.workspaceId = member.workspace._id.toString();
    entity.workspaceBranchIds = member.workspaceBranches.map((b) =>
      b._id.toString(),
    );
    entity.userId = member.userId;
    entity.data = reportData;
    entity.updatedAt = DateTime.getNowInSeconds();
    entity.status = !!entity._id
      ? ReportStatus.SYNCED
      : ReportStatus.JUST_CREATED;
    entity.fromTime = 0;
    entity.toTime = DateTime.getNowInSeconds();

    await this.repository.save(entity).catch(async (error) => {
      if (error instanceof MongoBulkWriteError && error.code === 11000) {
        const report = await this.repository.findOne({
          where: { ref: reportRef },
        });
        if (report) return report;
      }

      throw error;
    });

    if (isSynced) {
      this.queueProducers.captureEvent({
        ref: entity._id.toString(),
        channel: EventChannel.PERSONAL,
        type: EventType.REPORT_METRICS_SYNCED,
        actionType: EventDataActionType.UPDATE,
        workspaceId: member.workspaceId,
        userId: member.userId,
        data: entity,
      });
    }

    return entity;
  }

  async syncWorkspaceReports(input: SyncWorkspaceReportsInput) {
    let where: any = { workspaceId: input.workspaceId };

    if (input.timeRange) {
      // Add overlap time range to where
      const OR = [];

      // Inside
      OR.push({
        fromTime: { $gte: input.timeRange.fromTime },
        toTime: { $lte: input.timeRange.toTime },
      });

      // Left side
      OR.push({
        fromTime: { $lte: input.timeRange.fromTime },
        toTime: {
          $gte: input.timeRange.fromTime,
          $lte: input.timeRange.toTime,
        },
      });

      // Right side
      OR.push({
        fromTime: {
          $gte: input.timeRange.fromTime,
          $lte: input.timeRange.toTime,
        },
        toTime: { $lte: input.timeRange.toTime },
      });

      // Cover
      OR.push({
        fromTime: { $lt: input.timeRange.fromTime },
        toTime: { $gt: input.timeRange.toTime },
      });

      OR.push({
        type: ReportType.METRICS,
      });

      where['$or'] = OR;
    }

    const relatedReports = await this.repository.find({
      where,
      select: ['_id', 'status'],
      order: { toTime: -1 },
    });

    for (const report of relatedReports) {
      await this.queueProducers.syncReport({
        reportId: report._id.toString(),
        triggerBy: input.triggerBy,
      });
    }
  }

  async sync(input: SyncReportInput) {
    const report = await this.repository.findOne({
      where: { _id: mustBeObjectId(input.reportId) },
    });
    if (!report) return { message: 'Report not found or not ready for sync' };

    if (report.status === ReportStatus.SYNCING) {
      return { message: 'Report is already syncing' };
    }

    // Start sync
    report.status = ReportStatus.SYNCING;
    await this.repository.save(report);

    let syncedReport: ReportEntity<
      CombineTimeSeriesReport | CombineMetricsReport
    >;

    if (report.type === ReportType.TIME_SERIES) {
      await this.processExportTimeSeries({ ...report.dto, forceUpdate: true });
      syncedReport = await this.repository.findOne({
        where: { _id: report._id },
      });
    }

    if (report.type === ReportType.METRICS) {
      const member = await this.workspaceMembers.get({
        workspaceId: report.workspaceId,
        userId: report.userId,
      });
      if (!member || !report.userId)
        return { message: 'Report not have member information' };
      syncedReport = await this.getMetrics(member, true);
    }

    if (!syncedReport) {
      throw new BadRequestException(
        `Report type ${report.type} is not supported for syncing`,
      );
    }

    // End sync
    syncedReport.status = ReportStatus.SYNCED;
    await this.repository.save(syncedReport);

    return { message: 'Report synced successfully' };
  }

  async purge() {
    await this.repository.deleteMany({});
  }

  async purgeWorkspaceReports(args: WithWorkspaceArgs) {
    const { workspaceId } = withWorkspaceArgs(args);
    await this.repository.deleteMany({ workspaceId });
  }

  async onModuleInit() {
    EventEmitter.defaultMaxListeners = 1000;
    this.exportTimeSeriesReportQueueEvents = new QueueEvents(
      QueueName.EXPORT_TIME_SERIES_REPORT,
      this.queueProducers.opts,
    );
    await this.exportTimeSeriesReportQueueEvents.waitUntilReady();
  }

  async onApplicationShutdown() {
    if (IS_TESTING) return;
    this.exportTimeSeriesReportQueueEvents.removeAllListeners();
    await this.exportTimeSeriesReportQueueEvents.close();
  }
}
