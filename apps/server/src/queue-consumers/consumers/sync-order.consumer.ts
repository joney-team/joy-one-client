import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { OrdersService } from '../../orders/orders.service';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.SYNC_ORDER, defaultWorkerOptions)
export class SyncOrderConsumer extends WorkerHost {
  constructor(private readonly service: OrdersService) {
    super();
  }

  async process(job: Job<{ orderId: string }>) {
    return this.service.sync({ id: job.data.orderId });
  }
}
