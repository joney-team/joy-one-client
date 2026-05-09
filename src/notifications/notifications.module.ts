import { forwardRef, Global, Module } from '@nestjs/common';
import { DevicesModule } from 'src/devices/devices.module';
import { MongoEntities } from '../database/database.utils';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { NotificationsController } from './notifications.controller';
import { NotificationEntity } from './notifications.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsResolver } from './notifications.resolver';

@Global()
@Module({
  providers: [NotificationsService, NotificationsResolver],
  controllers: [NotificationsController],
  imports: [
    MongoEntities(NotificationEntity),
    forwardRef(() => WorkspaceMembersModule),
    DevicesModule,
    WorkspacesModule,
    WorkspaceMembersModule,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
