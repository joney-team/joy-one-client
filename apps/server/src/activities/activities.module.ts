import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesResolver } from './activities.resolver';
import { MongoEntities } from '../database/database.utils';
import { ActivityEntity } from './entities/activity.entity';
import { QueueProducersModule } from '../queue-producers/queue-producers.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { ReactionsModule } from '../reactions/reactions.module';

@Module({
  providers: [ActivitiesService, ActivitiesResolver],
  imports: [
    MongoEntities(ActivityEntity),
    WorkspaceMembersModule,
    QueueProducersModule,
    ReactionsModule,
  ],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
