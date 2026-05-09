import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { MessageBoxesService } from '../../message-boxes/message-boxes.service';
import { NotifyNewMessageBoxToZaloGmfGroup } from '../../message-boxes/message-boxes.types';
import { QueueName } from '../queue-consumers.types';

@Processor(
  QueueName.NOTIFY_NEW_MESSAGE_BOX_TO_ZALO_GMF_GROUP,
  defaultWorkerOptions,
)
export class NotifyNewMessageBoxToZaloGmfGroupConsumer extends WorkerHost {
  constructor(private readonly service: MessageBoxesService) {
    super();
  }

  async process(job: Job<NotifyNewMessageBoxToZaloGmfGroup>) {
    return this.service.notifyNewMessageBoxToZaloGmfGroup(job.data);
  }
}
