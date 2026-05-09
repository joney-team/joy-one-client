import { Module } from '@nestjs/common';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspaceSubscriptionsModule } from '../workspace-subscriptions/workspace-subscriptions.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { SetupController } from './setup.controller';

@Module({
  controllers: [SetupController],
  imports: [
    UsersModule,
    WorkspacesModule,
    WorkspaceMembersModule,
    WorkspaceSubscriptionsModule,
    SubscriptionsModule,
  ],
})
export class SetupModule {}
