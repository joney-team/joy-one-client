import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { TasksService } from '../../tasks/tasks.service';
import { TaskMetricsArgs } from '../../tasks/tasks.types';
import { WithWorkspaceArgs } from '../../workspaces/workspaces.utils';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.SYNC_TASK_METRICS, defaultWorkerOptions)
export class SyncTaskMetricsConsumer extends WorkerHost {
  constructor(private readonly service: TasksService) {
    super();
  }

  async process(job: Job<WithWorkspaceArgs<TaskMetricsArgs>>) {
    return this.service.syncMetric(job.data);
  }
}
