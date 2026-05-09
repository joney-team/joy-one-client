import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { MongoEntities } from '../database/database.utils';
import { ReactionEntity } from './entities/reaction.entity';
import { ReactionsResolver } from './reactions.resolver';
import { QueueProducersModule } from '../queue-producers/queue-producers.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';

@Module({
  providers: [ReactionsService, ReactionsResolver],
  imports: [
    MongoEntities(ReactionEntity),
    WorkspaceMembersModule,
    QueueProducersModule,
  ],
  exports: [ReactionsService],
})
export class ReactionsModule {}
