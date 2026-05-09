import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { EventsService } from '../../events/events.service';
import { SendUserEventInput } from '../../events/events.types';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.SEND_USER_EVENT, defaultWorkerOptions)
export class SendUserEventConsumer extends WorkerHost {
  constructor(private readonly service: EventsService) {
    super();
  }

  async process(job: Job<SendUserEventInput>) {
    return this.service.sendUserEvent(job.data);
  }
}
