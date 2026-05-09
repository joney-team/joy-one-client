import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module, Provider } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { configs, IS_TESTING } from '../config/config';
import { EventsModule } from '../events/events.module';
import { LoansModule } from '../loans/loans.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { PluginAiAssistantsModule } from '../plugin-ai-assistants/plugin-ai-assistants.module';
import { PluginMailerModule } from '../plugin-mailer/plugin-mailer.module';
import { PluginMetaPagesModule } from '../plugin-meta-pages/plugin-meta-pages.module';
import { ProductCombosModule } from '../product-combos/product-combos.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { ReportsModule } from '../reports/reports.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { SearchModule } from '../search/search.module';
import { TasksModule } from '../tasks/tasks.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { AiAssistantResponseMessageBoxConsumer } from './consumers/ai-assistant-response-message-box.consumer';
import { CaptureEventConsumer } from './consumers/capture-event.consumer';
import { ExportTimeSeriesReportConsumer } from './consumers/export-time-series-report.consumer';
import { ForwardMetaWebhooksConsumer } from './consumers/forward-meta-webhooks.consumer';
import { SearchIndexConsumer } from './consumers/search-index.consumer';
import { SendMailConsumer } from './consumers/send-mail.consumer';
import { SendNotificationConsumer } from './consumers/send-notification.consumer';
import { SendUserEventConsumer } from './consumers/send-user-event.consumer';
import { SyncLoanConsumer } from './consumers/sync-loan.consumer';
import { SyncOrderConsumer } from './consumers/sync-order.consumer';
import { SyncReceiptConsumer } from './consumers/sync-receipt.consumer';
import { SyncReportRangeConsumer } from './consumers/sync-report.consumer';
import { SyncTaskConsumer } from './consumers/sync-task.consumer';
import { SyncReportsConsumer } from './consumers/sync-workspace-reports.consumer';
import { QueueName } from './queue-consumers.types';
import { RegisterWorkspaceScheduleConsumer } from './consumers/register-workspace-schedule.consumer';
import { NotifyNewCustomersToZaloGmfGroupConsumer } from './consumers/notify-new-customers-to-zalo-gmf-group.consumer';
import { CustomersModule } from '../customers/customers.module';
import { MessageBoxesModule } from '../message-boxes/message-boxes.module';
import { NotifyNewMessageBoxToZaloGmfGroupConsumer } from './consumers/notify-new-message-box-to-zalo-gmf-group.consumer';
import { NotifyNewBookingToZaloGmfGroupConsumer } from './consumers/notify-new-booking-to-zalo-gmf-group.consumer';
import { PluginZaloOAsModule } from '../plugin-zalo-oas/plugin-zalo-oas.module';
import { ZaloOaZnsNewBookingConsumer } from './consumers/zalo-oa-zns-new-booking';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { WorkspaceBranchesModule } from '../workspace-branches/workspace-branches.module';
import { WorkspaceStatsModule } from '../workspace-stats/workspace-stats.module';
import { AggregateWorkspaceStatsConsumer } from './consumers/aggregate-workspace-stats.consumer';
import { defaultJobOptions } from '../config/config.constants';
import { PluginEInvoicesModule } from '../plugin-e-invoices/plugin-e-invoices.module';
import { PluginEInvoicesCreateInvoiceConsumer } from './consumers/plugin-e-invoices-create.consumer';
import { ExternalStorageFetchSizeConsumer } from './consumers/external-storage-fetch-size.consumer';
import { PluginExternalStorageModule } from '../plugin-external-storage/plugin-external-storage.module';
import { SyncTaskMetricsConsumer } from './consumers/sync-task-metrics.consumer';
import { PurgeWorkspaceReportsConsumer } from './consumers/purge-workspace-reports.consumer';
import { ActivitiesModule } from '../activities/activities.module';
import { SyncActivityConsumer } from './consumers/async-activity.consumer';
import { HealthCheckLoansConsumer } from './consumers/health-check-loans.consumer';
import { RejectPendingLoansConsumer } from './consumers/reject-pending-loans.consumer';
import { ZaloOaWebhookConsumer } from './consumers/zalo-oa-webhook.consumer';
import { MetaPagesWebhookConsumer } from './consumers/meta-pages-webhook.consumer';
import { ProcessFileExportConsumer } from './consumers/process-file-export.consumer';
import { FileExportsModule } from '../file-exports/file-exports.module';

const queueBoardModules = Object.values(QueueName).reduce((acc, name) => {
  acc.push(BullBoardModule.forFeature({ name, adapter: BullMQAdapter }));
  return acc;
}, []);

const mainConsumers: Provider[] = [
  CaptureEventConsumer,
  SendUserEventConsumer,
  RegisterWorkspaceScheduleConsumer,
];

const workerConsumers: Provider[] = [
  SearchIndexConsumer,
  SyncReportsConsumer,
  SyncReportRangeConsumer,
  SendNotificationConsumer,
  SendMailConsumer,
  AiAssistantResponseMessageBoxConsumer,
  ForwardMetaWebhooksConsumer,
  ExportTimeSeriesReportConsumer,
  SyncReceiptConsumer,

  SyncOrderConsumer,
  SyncTaskConsumer,
  NotifyNewBookingToZaloGmfGroupConsumer,
  NotifyNewCustomersToZaloGmfGroupConsumer,
  NotifyNewMessageBoxToZaloGmfGroupConsumer,
  AggregateWorkspaceStatsConsumer,
  PluginEInvoicesCreateInvoiceConsumer,
  ExternalStorageFetchSizeConsumer,
  SyncTaskMetricsConsumer,
  PurgeWorkspaceReportsConsumer,
  SyncActivityConsumer,

  // Loans
  SyncLoanConsumer,
  HealthCheckLoansConsumer,
  RejectPendingLoansConsumer,

  // Zalo OA
  ZaloOaZnsNewBookingConsumer,
  ZaloOaWebhookConsumer,

  // Meta Pages
  MetaPagesWebhookConsumer,

  // File Exports
  ProcessFileExportConsumer,
];

const getConsumerProviders = (): Provider[] => {
  if (IS_TESTING) {
    return [];
  }

  if (configs.APP_MODE === 'SINGLE') {
    return [...mainConsumers, ...workerConsumers];
  }

  if (configs.APP_MODE === 'MAIN') {
    return mainConsumers;
  }

  if (configs.APP_MODE === 'WORKER') {
    return workerConsumers;
  }

  return [];
};

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: configs.BULL_REDIS_URL,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        sentinelReconnectStrategy: (retries) => Math.min(retries * 500, 5000),
      },
      defaultJobOptions,
      prefix: `${configs.APP_NAME}-${configs.ENV}-Queue-v4`,
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    // Features
    CustomersModule,
    EventsModule,
    ReportsModule,
    BookingsModule,
    SearchModule,
    ProductCombosModule,
    NotificationsModule,
    OrdersModule,
    SchedulingModule,
    ReceiptsModule,
    LoansModule,
    TasksModule,
    WorkspacesModule,
    WorkspaceBranchesModule,
    WorkspaceMembersModule,
    WorkspaceStatsModule,
    MessageBoxesModule,
    ActivitiesModule,
    // Plugins
    PluginMailerModule,
    PluginAiAssistantsModule,
    PluginMetaPagesModule,
    PluginZaloOAsModule,
    PluginEInvoicesModule,
    PluginExternalStorageModule,
    FileExportsModule,
    ...queueBoardModules,
  ],
  providers: getConsumerProviders(),
})
export class QueueConsumersModule {}
