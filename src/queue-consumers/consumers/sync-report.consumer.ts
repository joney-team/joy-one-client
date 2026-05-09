import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReportsService } from '../../reports/reports.service';
import { SyncReportInput } from '../../reports/reports.types';
import { QueueName } from '../queue-consumers.types';
import { defaultWorkerOptions } from '../../config/config.constants';

@Processor(QueueName.SYNC_REPORT, {
  ...defaultWorkerOptions,
  concurrency: 5,
  lockDuration: 600000,
})
export class SyncReportRangeConsumer extends WorkerHost {
  constructor(private readonly service: ReportsService) {
    super();
  }

  async process(job: Job<SyncReportInput>) {
    return this.service.sync(job.data);
  }
}
