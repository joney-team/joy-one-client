import { Processor, WorkerHost } from '@nestjs/bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { ReportsService } from '../../reports/reports.service';
import { QueueName } from '../queue-consumers.types';
import { WithWorkspaceArgs } from '../../workspaces/workspaces.utils';
import { Job } from 'bullmq';

@Processor(QueueName.PURGE_WORKSPACE_REPORTS, defaultWorkerOptions)
export class PurgeWorkspaceReportsConsumer extends WorkerHost {
  constructor(private readonly service: ReportsService) {
    super();
  }

  async process(job: Job<WithWorkspaceArgs>) {
    return this.service.purgeWorkspaceReports(job.data);
  }
}
