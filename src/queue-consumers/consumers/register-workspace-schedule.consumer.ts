import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { SchedulingService } from '../../scheduling/scheduling.service';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.REGISTER_WORKSPACE_SCHEDULE, defaultWorkerOptions)
export class RegisterWorkspaceScheduleConsumer extends WorkerHost {
  constructor(private readonly service: SchedulingService) {
    super();
  }

  async process(job: Job<{ workspaceId: string }>) {
    return this.service.registerWorkspaceSchedule(job.data.workspaceId);
  }
}
