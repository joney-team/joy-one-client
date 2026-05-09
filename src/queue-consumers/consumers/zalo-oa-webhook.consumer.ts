import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { PluginZaloOasService } from '../../plugin-zalo-oas/plugin-zalo-oas.service';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.ZALO_OA_WEBHOOK, defaultWorkerOptions)
export class ZaloOaWebhookConsumer extends WorkerHost {
  constructor(private readonly service: PluginZaloOasService) {
    super();
  }

  async process(job: Job<Record<string, unknown>>) {
    return this.service.processWebhook(job.data);
  }
}
