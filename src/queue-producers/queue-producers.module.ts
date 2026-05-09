import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { QueueName } from '../queue-consumers/queue-consumers.types';
import { QueueProducersController } from './queue-producers.controller';
import { QueueProducersService } from './queue-producers.service';

@Global()
@Module({
  imports: Object.values(QueueName).map((queueName) =>
    BullModule.registerQueue({ name: queueName }),
  ),
  providers: [QueueProducersService],
  exports: [QueueProducersService],
  controllers: [QueueProducersController],
})
export class QueueProducersModule {}
