import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { SearchService } from '../../search/search.service';
import { SearchIndexInput } from '../../search/search.types';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.SEARCH_INDEX, defaultWorkerOptions)
export class SearchIndexConsumer extends WorkerHost {
  constructor(private readonly service: SearchService) {
    super();
  }

  async process(job: Job<SearchIndexInput>) {
    if (!job.data.id) return;
    return this.service.index(job.data);
  }
}
