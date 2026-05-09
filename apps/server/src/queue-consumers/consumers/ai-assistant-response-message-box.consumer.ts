import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PluginAiAssistantsService } from '../../plugin-ai-assistants/plugin-ai-assistants.service';
import { PluginAiAssistantResponseMessageBoxInput } from '../../plugin-ai-assistants/plugin-ai-assistants.types';
import { QueueName } from '../queue-consumers.types';
import { defaultWorkerOptions } from '../../config/config.constants';

@Processor(QueueName.AI_ASSISTANT_RESPONSE_MESSAGE_BOX, defaultWorkerOptions)
export class AiAssistantResponseMessageBoxConsumer extends WorkerHost {
  constructor(private readonly service: PluginAiAssistantsService) {
    super();
  }

  async process(job: Job<PluginAiAssistantResponseMessageBoxInput>) {
    return this.service.responseMessageBox(job.data);
  }
}
