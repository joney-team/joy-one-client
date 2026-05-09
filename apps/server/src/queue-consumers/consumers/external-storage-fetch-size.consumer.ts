import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { PluginExternalStorageService } from '../../plugin-external-storage/plugin-external-storage.service';
import { WithWorkspaceArgs } from '../../workspaces/workspaces.utils';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.EXTERNAL_STORAGE_FETCH_SIZE, defaultWorkerOptions)
export class ExternalStorageFetchSizeConsumer extends WorkerHost {
  constructor(private readonly service: PluginExternalStorageService) {
    super();
  }

  async process(job: Job<WithWorkspaceArgs<{ test: number }>>) {
    return this.service.fetchSize(job.data);
  }
}
