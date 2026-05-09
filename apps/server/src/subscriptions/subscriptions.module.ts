import { Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionEntity } from './entities/subscription.entity';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  providers: [SubscriptionsService],
  controllers: [SubscriptionsController],
  imports: [MongoEntities(SubscriptionEntity)],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
