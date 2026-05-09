import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { PluginMailerService } from '../../plugin-mailer/plugin-mailer.service';
import { SendMailInput } from '../../plugin-mailer/plugin-mailer.types';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.SEND_MAIL, defaultWorkerOptions)
export class SendMailConsumer extends WorkerHost {
  constructor(private readonly service: PluginMailerService) {
    super();
  }

  async process(job: Job<SendMailInput>) {
    return this.service.send(job.data);
  }
}
