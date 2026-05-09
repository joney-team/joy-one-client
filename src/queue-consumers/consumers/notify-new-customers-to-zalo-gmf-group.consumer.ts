import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { CustomersService } from '../../customers/customers.service';
import { NotifyNewCustomerToZaloGmfGroup } from '../../customers/customers.types';
import { QueueName } from '../queue-consumers.types';

@Processor(
  QueueName.NOTIFY_NEW_CUSTOMER_TO_ZALO_GMF_GROUP,
  defaultWorkerOptions,
)
export class NotifyNewCustomersToZaloGmfGroupConsumer extends WorkerHost {
  constructor(private readonly service: CustomersService) {
    super();
  }

  async process(job: Job<NotifyNewCustomerToZaloGmfGroup>) {
    return this.service.notifyNewCustomerToZaloGmfGroup(job.data);
  }
}
