import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { PluginEInvoicesService } from '../../plugin-e-invoices/plugin-e-invoices.service';
import { GenerateEInvoiceDataInput } from '../../plugin-e-invoices/plugin-e-invoices.types';
import { WithWorkspaceArgs } from '../../workspaces/workspaces.utils';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.PLUGIN_E_INVOICES_CREATE_INVOICE, defaultWorkerOptions)
export class PluginEInvoicesCreateInvoiceConsumer extends WorkerHost {
  constructor(private readonly service: PluginEInvoicesService) {
    super();
  }

  async process(
    job: Job<WithWorkspaceArgs<{ input: GenerateEInvoiceDataInput }>>,
  ) {
    return this.service.createEInvoice(job.data);
  }
}
