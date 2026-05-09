import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { NotificationsService } from '../../notifications/notifications.service';
import { SendNotificationInput } from '../../notifications/notifications.types';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.SEND_NOTIFICATION, defaultWorkerOptions)
export class SendNotificationConsumer extends WorkerHost {
  constructor(private readonly service: NotificationsService) {
    super();
  }

  async process(job: Job<SendNotificationInput>) {
    return this.service.send(job.data);
  }
}
