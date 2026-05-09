import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReportsService } from '../../reports/reports.service';
import { SyncWorkspaceReportsInput } from '../../reports/reports.types';
import { QueueName } from '../queue-consumers.types';
import { defaultWorkerOptions } from '../../config/config.constants';

@Processor(QueueName.SYNC_WORKSPACE_REPORTS, {
  ...defaultWorkerOptions,
  concurrency: 1,
  lockDuration: 600000,
})
export class SyncReportsConsumer extends WorkerHost {
  constructor(private readonly service: ReportsService) {
    super();
  }

  async process(job: Job<SyncWorkspaceReportsInput>) {
    return this.service.syncWorkspaceReports(job.data);
  }
}
