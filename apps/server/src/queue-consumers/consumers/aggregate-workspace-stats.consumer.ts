import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WorkspaceStatsService } from '../../workspace-stats/workspace-stats.service';
import { QueueName } from '../queue-consumers.types';
import { defaultWorkerOptions } from '../../config/config.constants';

export interface AggregateWorkspaceStatsArgs {
  workspaceId: string;
}

@Processor(QueueName.AGGREGATE_WORKSPACE_STATS, defaultWorkerOptions)
export class AggregateWorkspaceStatsConsumer extends WorkerHost {
  constructor(private readonly service: WorkspaceStatsService) {
    super();
  }

  async process(job: Job<AggregateWorkspaceStatsArgs>) {
    return this.service.aggregate(job.data.workspaceId);
  }
}
