import { forwardRef, Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { UsersModule } from '../users/users.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { WorkspaceApiAppsController } from './workspace-api-apps.controller';
import { WorkspaceApiAppEntity } from './entities/workspace-api-app.entity';
import { WorkspaceApiAppsService } from './workspace-api-apps.service';
import { WorkspaceApiAppsResolver } from './workspace-api-apps.resolver';

@Module({
  controllers: [WorkspaceApiAppsController],
  providers: [WorkspaceApiAppsService, WorkspaceApiAppsResolver],
  imports: [
    MongoEntities(WorkspaceApiAppEntity),
    forwardRef(() => UsersModule),
    forwardRef(() => WorkspaceMembersModule),
    forwardRef(() => WorkspacesModule),
  ],
  exports: [WorkspaceApiAppsService],
})
export class WorkspaceApiAppsModule {}
