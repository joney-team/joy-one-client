import { Module } from '@nestjs/common';
import { DevicesModule } from '../devices/devices.module';
import { MetaModule } from '../meta/meta.module';
import { UserAuthSessionsModule } from '../user-auth-sessions/user-auth-sessions.module';
import { UsersModule } from '../users/users.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';

@Module({
  providers: [AuthService, AuthResolver],
  controllers: [AuthController],
  imports: [
    UsersModule,
    WorkspacesModule,
    WorkspaceMembersModule,
    UserAuthSessionsModule,
    MetaModule,
    DevicesModule,
  ],
  exports: [AuthService],
})
export class AuthModule {}
