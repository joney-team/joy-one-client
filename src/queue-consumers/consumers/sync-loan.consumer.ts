import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { LoansService } from '../../loans/loans.service';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.SYNC_LOAN, {
  ...defaultWorkerOptions,
  concurrency: 5,
  lockDuration: 300000,
})
export class SyncLoanConsumer extends WorkerHost {
  constructor(private readonly service: LoansService) {
    super();
  }

  async process(job: Job<{ loanId: string }>) {
    return this.service.sync(job.data.loanId);
  }
}
