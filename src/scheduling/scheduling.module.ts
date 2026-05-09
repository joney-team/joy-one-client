import { Module } from '@nestjs/common';
import { BookingsModule } from 'src/bookings/bookings.module';
import { CustomersModule } from 'src/customers/customers.module';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';
import { PluginEInvoicesModule } from '../plugin-e-invoices/plugin-e-invoices.module';
import { PluginZaloOAsModule } from '../plugin-zalo-oas/plugin-zalo-oas.module';
import { ProductsModule } from '../products/products.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { ReportsModule } from '../reports/reports.module';
import { TasksModule } from '../tasks/tasks.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspaceSettingsModule } from '../workspace-settings/workspace-settings.module';
import { WorkspaceSubscriptionsModule } from '../workspace-subscriptions/workspace-subscriptions.module';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';

@Module({
  providers: [SchedulingService],
  controllers: [SchedulingController],
  imports: [
    WorkspacesModule,
    WorkspaceMembersModule,
    WorkspaceSettingsModule,
    WorkspaceSubscriptionsModule,
    CustomersModule,
    BookingsModule,
    TasksModule,
    ProductsModule,
    ReceiptsModule,
    PluginZaloOAsModule,
    ReportsModule,
    PluginEInvoicesModule,
  ],
  exports: [SchedulingService],
})
export class SchedulingModule {}
