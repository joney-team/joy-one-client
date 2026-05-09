import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ActivitiesService } from '../../activities/activities.service';
import { defaultWorkerOptions } from '../../config/config.constants';
import { WithWorkspaceArgs } from '../../workspaces/workspaces.utils';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.SYNC_ACTIVITY, defaultWorkerOptions)
export class SyncActivityConsumer extends WorkerHost {
  constructor(private readonly service: ActivitiesService) {
    super();
  }

  async process(job: Job<WithWorkspaceArgs<{ _id: string }>>) {
    return this.service.sync(job.data);
  }
}
