import { Global, Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { PluginMailerController } from './plugin-mailer.controller';
import { PluginMailerService } from './plugin-mailer.service';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { UsersModule } from '../users/users.module';
import { PluginMailerResolver } from './plugin-mailer.resolver';

@Global()
@Module({
  providers: [PluginMailerService, PluginMailerResolver],
  controllers: [PluginMailerController],
  imports: [WorkspacesModule, WorkspaceMembersModule, UsersModule],
  exports: [PluginMailerService],
})
export class PluginMailerModule {}
