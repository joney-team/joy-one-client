import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { PluginMetaPagesService } from '../../plugin-meta-pages/plugin-meta-pages.service';
import { ForwardMetaWebhookDto } from '../../plugin-meta-pages/plugin-meta-pages.types';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.FORWARD_META_WEBHOOKS, defaultWorkerOptions)
export class ForwardMetaWebhooksConsumer extends WorkerHost {
  constructor(private readonly service: PluginMetaPagesService) {
    super();
  }

  async process(job: Job<ForwardMetaWebhookDto>) {
    return this.service.forwardWebhook(job.data);
  }
}
