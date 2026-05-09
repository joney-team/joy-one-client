import { forwardRef, Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { MongoEntities } from '../database/database.utils';
import { WorkspacePartnersModule } from '../partners/partners.module';
import { TagsModule } from '../tags/tags.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspaceSettingsModule } from '../workspace-settings/workspace-settings.module';
import { TasksController } from './tasks.controller';
import { TaskEntity } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { TasksResolver, TaskTimeTrackingResolver } from './tasks.resolver';
import { TaskStatusesEntity } from './entities/task-statuses.entity';
import { TaskMetricsEntity } from './entities/task-metrics.entity';

@Module({
  providers: [TasksService, TasksResolver, TaskTimeTrackingResolver],
  controllers: [TasksController],
  imports: [
    MongoEntities(TaskEntity, TaskStatusesEntity, TaskMetricsEntity),
    forwardRef(() => WorkspaceMembersModule),
    TagsModule,
    WorkspacePartnersModule,
    CustomersModule,
    WorkspaceSettingsModule,
  ],
  exports: [TasksService],
})
export class TasksModule {}
