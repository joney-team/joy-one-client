import { forwardRef, Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { FilesModule } from '../files/files.module';
import { PluginMetaPagesModule } from '../plugin-meta-pages/plugin-meta-pages.module';
import { PluginZaloOAsModule } from '../plugin-zalo-oas/plugin-zalo-oas.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { WorkspaceBillingsModule } from '../workspace-billings/workspace-billings.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspaceSubscriptionsController } from './workspace-subscriptions.controller';
import { WorkspaceSubscriptionEntity } from './entities/workspace-subscription.entity';
import { WorkspaceSubscriptionsService } from './workspace-subscriptions.service';

@Module({
  controllers: [WorkspaceSubscriptionsController],
  providers: [WorkspaceSubscriptionsService],
  imports: [
    MongoEntities(WorkspaceSubscriptionEntity),
    SubscriptionsModule,
    FilesModule,
    PluginMetaPagesModule,
    PluginZaloOAsModule,
    forwardRef(() => FilesModule),
    forwardRef(() => WorkspaceMembersModule),
    forwardRef(() => WorkspaceBillingsModule),
  ],
  exports: [WorkspaceSubscriptionsService],
})
export class WorkspaceSubscriptionsModule {}
