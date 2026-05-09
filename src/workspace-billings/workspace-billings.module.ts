import { forwardRef, Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { UsersModule } from '../users/users.module';
import { WorkspaceSubscriptionsModule } from '../workspace-subscriptions/workspace-subscriptions.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { WorkspaceBillingsController } from './workspace-billings.controller';
import { WorkspaceBillingEntity } from './entities/workspace-billing.entity';
import { WorkspaceBillingsService } from './workspace-billings.service';

@Module({
  providers: [WorkspaceBillingsService],
  controllers: [WorkspaceBillingsController],
  imports: [
    MongoEntities(WorkspaceBillingEntity),
    UsersModule,
    forwardRef(() => WorkspacesModule),
    forwardRef(() => WorkspaceSubscriptionsModule),
  ],
  exports: [WorkspaceBillingsService],
})
export class WorkspaceBillingsModule {}
