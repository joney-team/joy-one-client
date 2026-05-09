import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BookingsService } from '../../bookings/bookings.service';
import { defaultWorkerOptions } from '../../config/config.constants';
import { EventType } from '../../events/events.types';
import { QueueName } from '../queue-consumers.types';

export type NotifyNewBookingToZaloGmfGroup = {
  bookingId: string;
  eventType: EventType;
  workspaceId: string;
};

@Processor(QueueName.NOTIFY_NEW_BOOKING_TO_ZALO_GMF_GROUP, defaultWorkerOptions)
export class NotifyNewBookingToZaloGmfGroupConsumer extends WorkerHost {
  constructor(private readonly service: BookingsService) {
    super();
  }

  async process(job: Job<NotifyNewBookingToZaloGmfGroup>) {
    return this.service.notifyNewBookingToGmfGroup(job.data);
  }
}
