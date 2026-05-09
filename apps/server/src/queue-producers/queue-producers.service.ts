import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { logger } from '../app.logger';
import { IS_TESTING } from '../config/config';
import { defaultJobOptions } from '../config/config.constants';
import { NotifyNewCustomerToZaloGmfGroup } from '../customers/customers.types';
import type {
  CaptureEventInput,
  SendUserEventInput,
} from '../events/events.types';
import { NotifyNewMessageBoxToZaloGmfGroup } from '../message-boxes/message-boxes.types';
import type { SendNotificationInput } from '../notifications/notifications.types';
import type { PluginAiAssistantResponseMessageBoxInput } from '../plugin-ai-assistants/plugin-ai-assistants.types';
import { GenerateEInvoiceDataInput } from '../plugin-e-invoices/plugin-e-invoices.types';
import type { SendMailInput } from '../plugin-mailer/plugin-mailer.types';
import type { ForwardMetaWebhookDto } from '../plugin-meta-pages/plugin-meta-pages.types';
import { AggregateWorkspaceStatsArgs } from '../queue-consumers/consumers/aggregate-workspace-stats.consumer';
import { NotifyNewBookingToZaloGmfGroup } from '../queue-consumers/consumers/notify-new-booking-to-zalo-gmf-group.consumer';
import { SendZaloOaZnsNewBookingArgs } from '../queue-consumers/consumers/zalo-oa-zns-new-booking';
import { QueueName } from '../queue-consumers/queue-consumers.types';
import type {
  ExportReportByRangeTimeInput,
  SyncReportInput,
  SyncWorkspaceReportsInput,
} from '../reports/reports.types';
import type { ProcessFileExportJobData } from '../file-exports/file-exports.types';
import type { SearchIndexInput } from '../search/search.types';
import { TaskMetricsArgs } from '../tasks/tasks.types';
import { wait } from '../utils/wait.utils';
import { WithWorkspaceArgs } from '../workspaces/workspaces.utils';

@Injectable()
export class QueueProducersService {
  constructor(
    @InjectQueue(QueueName.CAPTURE_EVENT)
    private captureEventQueue: Queue,
    @InjectQueue(QueueName.SEND_NOTIFICATION)
    private sendNotificationQueue: Queue,
    @InjectQueue(QueueName.SEND_MAIL)
    private sendMailQueue: Queue,
    @InjectQueue(QueueName.SEARCH_INDEX)
    private searchIndexQueue: Queue,
    @InjectQueue(QueueName.SYNC_REPORT)
    private syncReportQueue: Queue,
    @InjectQueue(QueueName.SYNC_WORKSPACE_REPORTS)
    private syncWorkspaceReportsQueue: Queue,
    @InjectQueue(QueueName.EXPORT_TIME_SERIES_REPORT)
    private exportTimeSeriesReportQueue: Queue,
    @InjectQueue(QueueName.AI_ASSISTANT_RESPONSE_MESSAGE_BOX)
    private aiAssistantResponseMessageBoxQueue: Queue,
    @InjectQueue(QueueName.FORWARD_META_WEBHOOKS)
    private forwardMetaWebhooksQueue: Queue,
    @InjectQueue(QueueName.SEND_USER_EVENT)
    private sendUserEventQueue: Queue,
    @InjectQueue(QueueName.REGISTER_WORKSPACE_SCHEDULE)
    private registerWorkspaceScheduleQueue: Queue,
    @InjectQueue(QueueName.SYNC_RECEIPT)
    private syncReceiptQueue: Queue,
    @InjectQueue(QueueName.SYNC_LOAN)
    private syncLoanQueue: Queue,
    @InjectQueue(QueueName.REJECT_PENDING_LOANS)
    private rejectPendingLoansQueue: Queue,
    @InjectQueue(QueueName.HEALTH_CHECK_LOANS)
    private healthCheckLoansQueue: Queue,
    @InjectQueue(QueueName.SYNC_ORDER)
    private syncOrderQueue: Queue,
    @InjectQueue(QueueName.SYNC_TASK)
    private syncTaskQueue: Queue,
    @InjectQueue(QueueName.NOTIFY_NEW_BOOKING_TO_ZALO_GMF_GROUP)
    private notifyZaloGmfGroupQueue: Queue,
    @InjectQueue(QueueName.NOTIFY_NEW_CUSTOMER_TO_ZALO_GMF_GROUP)
    private notifyNewCustomerToZaloGmfGroupQueue: Queue,
    @InjectQueue(QueueName.NOTIFY_NEW_MESSAGE_BOX_TO_ZALO_GMF_GROUP)
    private notifyNewMessageBoxToZaloGmfGroupQueue: Queue,
    @InjectQueue(QueueName.ZALO_OA_ZNS_NEW_BOOKING)
    private zaloOaZnsNewBookingQueue: Queue,
    @InjectQueue(QueueName.AGGREGATE_WORKSPACE_STATS)
    private aggregateWorkspaceStatsQueue: Queue,
    @InjectQueue(QueueName.PLUGIN_E_INVOICES_CREATE_INVOICE)
    private pluginEInvoicesCreateInvoiceQueue: Queue,
    @InjectQueue(QueueName.EXTERNAL_STORAGE_FETCH_SIZE)
    private externalStorageFetchSizeQueue: Queue,
    @InjectQueue(QueueName.SYNC_TASK_METRICS)
    private syncTaskMetricsQueue: Queue,
    @InjectQueue(QueueName.PURGE_WORKSPACE_REPORTS)
    private purgeWorkspaceReportsQueue: Queue,
    @InjectQueue(QueueName.SYNC_ACTIVITY)
    private syncActivityQueue: Queue,
    @InjectQueue(QueueName.ZALO_OA_WEBHOOK)
    private zaloOaWebhookQueue: Queue,
    @InjectQueue(QueueName.META_PAGES_WEBHOOK)
    private metaPagesWebhookQueue: Queue,
    @InjectQueue(QueueName.PROCESS_FILE_EXPORT)
    private processFileExportQueue: Queue,
  ) {}

  isAvailable() {
    return !IS_TESTING;
  }

  get opts() {
    return this.purgeWorkspaceReportsQueue.opts;
  }

  async captureEvent(input: CaptureEventInput, delay = 0) {
    if (!this.isAvailable()) return;

    await wait(delay);
    this.captureEventQueue
      .add('PROCESS', input)
      .catch((error) => logger.error(error));
  }

  async sendNotification(input: SendNotificationInput) {
    if (!this.isAvailable()) return;
    return this.sendNotificationQueue.add('PROCESS', input);
  }

  async sendMail(input: SendMailInput) {
    if (!this.isAvailable()) return;
    return this.sendMailQueue.add('PROCESS', input);
  }

  async searchIndex(input: SearchIndexInput) {
    if (!this.isAvailable()) return;
    return this.searchIndexQueue.add('PROCESS', input);
  }

  async syncReport(input: SyncReportInput) {
    if (!this.isAvailable()) return;
    return this.syncReportQueue.add('PROCESS', input);
  }

  async syncWorkspaceReports(input: SyncWorkspaceReportsInput) {
    if (!this.isAvailable()) return;
    return this.syncWorkspaceReportsQueue.add('PROCESS', input);
  }

  async exportTimeSeriesReport(
    input: ExportReportByRangeTimeInput,
    priority = 0,
  ) {
    if (!this.isAvailable()) return;
    return this.exportTimeSeriesReportQueue.add('PROCESS', input, {
      ...defaultJobOptions,
      priority,
    });
  }

  async aiAssistantResponseMessageBox(
    dto: PluginAiAssistantResponseMessageBoxInput,
  ) {
    if (!this.isAvailable()) return;
    return this.aiAssistantResponseMessageBoxQueue.add('PROCESS', dto);
  }

  async forwardMetaWebhooks(dto: ForwardMetaWebhookDto) {
    if (!this.isAvailable()) return;
    return this.forwardMetaWebhooksQueue.add('PROCESS', dto);
  }

  async sendUserEvent(input: SendUserEventInput) {
    if (!this.isAvailable()) return;
    return this.sendUserEventQueue.add('PROCESS', input);
  }

  async registerWorkspaceSchedule(workspaceId: string) {
    if (!this.isAvailable()) return;
    return this.registerWorkspaceScheduleQueue.add('PROCESS', { workspaceId });
  }

  async syncReceipt(receiptId: string) {
    if (!this.isAvailable()) return;
    return this.syncReceiptQueue.add('PROCESS', { receiptId });
  }

  async syncLoan(loanId: string) {
    if (!this.isAvailable()) return;
    return this.syncLoanQueue.add('PROCESS', { loanId });
  }

  async syncOrder(orderId: string) {
    if (!this.isAvailable()) return;
    return this.syncOrderQueue.add('PROCESS', { orderId });
  }

  async syncTask(args: WithWorkspaceArgs<{ _id: string }>) {
    if (!this.isAvailable()) return;
    return this.syncTaskQueue.add('PROCESS', args);
  }

  async notifyNewBookingToZaloGmfGroup(dto: NotifyNewBookingToZaloGmfGroup) {
    if (!this.isAvailable()) return;
    return this.notifyZaloGmfGroupQueue.add('PROCESS', dto);
  }

  async notifyNewCustomerToZaloGmfGroup(dto: NotifyNewCustomerToZaloGmfGroup) {
    if (!this.isAvailable()) return;
    return this.notifyNewCustomerToZaloGmfGroupQueue.add('PROCESS', dto);
  }

  async notifyNewMessageBoxToZaloGmfGroup(
    dto: NotifyNewMessageBoxToZaloGmfGroup,
  ) {
    if (!this.isAvailable()) return;
    return this.notifyNewMessageBoxToZaloGmfGroupQueue.add('PROCESS', dto);
  }

  async sendZaloOaZnsNewBooking(args: SendZaloOaZnsNewBookingArgs) {
    if (!this.isAvailable()) return;
    return this.zaloOaZnsNewBookingQueue.add('PROCESS', args);
  }

  async aggregateWorkspaceStats(args: AggregateWorkspaceStatsArgs) {
    if (!this.isAvailable()) return;
    return this.aggregateWorkspaceStatsQueue.add('PROCESS', args);
  }

  async pluginEInvoicesCreateInvoice(
    args: WithWorkspaceArgs<{ input: GenerateEInvoiceDataInput }>,
  ) {
    if (!this.isAvailable()) return;
    return this.pluginEInvoicesCreateInvoiceQueue.add('PROCESS', args);
  }

  async externalStorageFetchSize(args: WithWorkspaceArgs) {
    if (!this.isAvailable()) return;
    return this.externalStorageFetchSizeQueue.add('PROCESS', args);
  }

  async syncTaskMetrics(args: WithWorkspaceArgs<TaskMetricsArgs>) {
    if (!this.isAvailable()) return;
    return this.syncTaskMetricsQueue.add('PROCESS', args);
  }

  async purgeWorkspaceReports(args: WithWorkspaceArgs) {
    if (!this.isAvailable()) return;
    return this.purgeWorkspaceReportsQueue.add('PROCESS', args);
  }

  async syncActivity(args: WithWorkspaceArgs<{ _id: string }>) {
    if (!this.isAvailable()) return;
    return this.syncActivityQueue.add('PROCESS', args);
  }

  async healthCheckLoans(args: WithWorkspaceArgs) {
    if (!this.isAvailable()) return;
    return this.healthCheckLoansQueue.add('PROCESS', args);
  }

  async rejectPendingLoans(args: WithWorkspaceArgs) {
    if (!this.isAvailable()) return;
    return this.rejectPendingLoansQueue.add('PROCESS', args);
  }

  async processZaloOaWebhook(body: Record<string, unknown>) {
    if (!this.isAvailable()) return;
    return this.zaloOaWebhookQueue.add('PROCESS', body);
  }

  async processMetaPagesWebhook(body: unknown) {
    if (!this.isAvailable()) return;
    return this.metaPagesWebhookQueue.add('PROCESS', body);
  }

  async processFileExport(data: ProcessFileExportJobData) {
    if (!this.isAvailable()) return;
    return this.processFileExportQueue.add('PROCESS', data);
  }
}
