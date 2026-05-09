import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { PluginMetaPagesService } from '../../plugin-meta-pages/plugin-meta-pages.service';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.META_PAGES_WEBHOOK, defaultWorkerOptions)
export class MetaPagesWebhookConsumer extends WorkerHost {
  constructor(private readonly service: PluginMetaPagesService) {
    super();
  }

  async process(job: Job) {
    return this.service.processWebhook(job.data);
  }
}
