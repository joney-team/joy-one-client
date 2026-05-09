import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { ReceiptsService } from '../../receipts/receipts.service';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.SYNC_RECEIPT, defaultWorkerOptions)
export class SyncReceiptConsumer extends WorkerHost {
  constructor(private readonly service: ReceiptsService) {
    super();
  }

  async process(job: Job<{ receiptId: string }>) {
    return this.service.sync(job.data.receiptId);
  }
}
