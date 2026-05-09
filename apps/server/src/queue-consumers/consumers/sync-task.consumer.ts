import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { TasksService } from '../../tasks/tasks.service';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.SYNC_TASK, defaultWorkerOptions)
export class SyncTaskConsumer extends WorkerHost {
  constructor(private readonly service: TasksService) {
    super();
  }

  async process(job: Job<{ _id: string; workspaceId: string }>) {
    const { updateInfos } = await this.service.sync(job.data);
    return { updateInfos };
  }
}
