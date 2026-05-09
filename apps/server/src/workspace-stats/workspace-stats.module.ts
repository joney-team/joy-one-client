import { Module } from '@nestjs/common';
import { PluginMessageHubsModule } from 'src/plugin-message-hubs/plugin-message-hubs.module';
import { PluginMetaPagesModule } from 'src/plugin-meta-pages/plugin-meta-pages.module';
import { PluginZaloOAsModule } from 'src/plugin-zalo-oas/plugin-zalo-oas.module';
import { BookingsModule } from '../bookings/bookings.module';
import { CustomersModule } from '../customers/customers.module';
import { MongoEntities } from '../database/database.utils';
import { FilesModule } from '../files/files.module';
import { OrdersModule } from '../orders/orders.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { WorkspaceStatsEntity } from './entities/workspace-stat.entity';
import { WorkspaceStatsResolver } from './workspace-stats.resolver';
import { WorkspaceStatsService } from './workspace-stats.service';

@Module({
  providers: [WorkspaceStatsService, WorkspaceStatsResolver],
  imports: [
    MongoEntities(WorkspaceStatsEntity),
    FilesModule,
    CustomersModule,
    BookingsModule,
    OrdersModule,
    WorkspacesModule,
    WorkspaceMembersModule,
    PluginMetaPagesModule,
    PluginZaloOAsModule,
    PluginMessageHubsModule,
  ],
  exports: [WorkspaceStatsService],
})
export class WorkspaceStatsModule {}
