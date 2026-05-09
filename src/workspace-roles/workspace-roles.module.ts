import { Module, forwardRef } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspaceSettingsModule } from '../workspace-settings/workspace-settings.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { WorkspaceRoleEntity } from './entities/workspace-role.entity';
import { WorkspaceRolesResolver } from './workspace-roles.resolver';
import { WorkspaceRolesService } from './workspace-roles.service';

@Module({
  providers: [WorkspaceRolesService, WorkspaceRolesResolver],
  imports: [
    MongoEntities(WorkspaceRoleEntity),
    forwardRef(() => WorkspacesModule),
    forwardRef(() => WorkspaceMembersModule),
    WorkspaceSettingsModule,
  ],
  exports: [WorkspaceRolesService],
})
export class WorkspaceRolesModule {}
