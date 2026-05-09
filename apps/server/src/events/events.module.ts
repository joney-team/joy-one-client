import { Global, Module } from '@nestjs/common';
import { DevicesModule } from 'src/devices/devices.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UsersModule } from 'src/users/users.module';
import { MongoEntities } from '../database/database.utils';
import { LoansModule } from '../loans/loans.module';
import { MessageBoxesModule } from '../message-boxes/message-boxes.module';
import { OrdersModule } from '../orders/orders.module';
import { WorkspacePartnersModule } from '../partners/partners.module';
import { PluginMailerModule } from '../plugin-mailer/plugin-mailer.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { TasksModule } from '../tasks/tasks.module';
import { WorkspaceBillingsModule } from '../workspace-billings/workspace-billings.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspaceRolesModule } from '../workspace-roles/workspace-roles.module';
import { WorkspaceSdksModule } from '../workspace-sdks/workspace-sdks.module';
import { WorkspaceSettingsModule } from '../workspace-settings/workspace-settings.module';
import { WorkspaceSubscriptionsModule } from '../workspace-subscriptions/workspace-subscriptions.module';
import { EventsController } from './events.controller';
import { EventEntity } from './events.entity';
import { EventsGateway } from './events.gateway';
import { EventsResolver } from './events.resolver';
import { EventsService } from './events.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Global()
@Module({
  providers: [EventsGateway, EventsService, EventsResolver],
  controllers: [EventsController],
  imports: [
    MongoEntities(EventEntity),

    UsersModule,
    DevicesModule,
    NotificationsModule,
    PluginMailerModule,

    WorkspacesModule,
    WorkspaceRolesModule,
    WorkspacePartnersModule,
    WorkspaceSubscriptionsModule,
    WorkspaceMembersModule,
    WorkspaceBillingsModule,
    WorkspaceSettingsModule,
    WorkspaceSdksModule,

    TasksModule,
    MessageBoxesModule,

    LoansModule,
    OrdersModule,
    ReceiptsModule,
  ],
  exports: [EventsService],
})
export class EventsModule { }
