import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { MongoEntities } from '../database/database.utils';
import { WorkspaceBranchesModule } from '../workspace-branches/workspace-branches.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspaceSettingsModule } from '../workspace-settings/workspace-settings.module';
import { WorkspacesController } from './workspaces.controller';
import { WorkspaceEntity } from './entities/workspace.entity';
import { WorkspacesResolver } from './workspaces.resolver';
import { WorkspacesService } from './workspaces.service';
@Module({
  providers: [WorkspacesService, WorkspacesResolver],
  controllers: [WorkspacesController],
  imports: [
    MongoEntities(WorkspaceEntity),
    UsersModule,
    forwardRef(() => WorkspaceMembersModule),
    forwardRef(() => WorkspaceBranchesModule),
    WorkspaceSettingsModule,
  ],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
