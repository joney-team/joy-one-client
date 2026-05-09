import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { EventsService } from '../../events/events.service';
import { CaptureEventInput } from '../../events/events.types';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.CAPTURE_EVENT, defaultWorkerOptions)
export class CaptureEventConsumer extends WorkerHost {
  constructor(private readonly service: EventsService) {
    super();
  }

  async process(job: Job<CaptureEventInput>) {
    return this.service.capture(job.data);
  }
}
