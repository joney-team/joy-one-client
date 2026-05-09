import { Module, forwardRef } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { UsersModule } from '../users/users.module';
import { WorkspaceBranchesModule } from '../workspace-branches/workspace-branches.module';
import { WorkspaceRolesModule } from '../workspace-roles/workspace-roles.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { WorkspaceMembersController } from './workspace-members.controller';
import { WorkspaceMemberEntity } from './entities/workspace-member.entity';
import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMembersResolver } from './workspace-members.resolver';
import { WorkspaceSettingsModule } from '../workspace-settings/workspace-settings.module';

@Module({
  providers: [WorkspaceMembersService, WorkspaceMembersResolver],
  controllers: [WorkspaceMembersController],
  imports: [
    MongoEntities(WorkspaceMemberEntity),
    forwardRef(() => UsersModule),
    forwardRef(() => WorkspacesModule),
    forwardRef(() => WorkspaceRolesModule),
    forwardRef(() => WorkspaceBranchesModule),
    forwardRef(() => WorkspaceSettingsModule),
  ],
  exports: [WorkspaceMembersService],
})
export class WorkspaceMembersModule {}
