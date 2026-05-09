import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { defaultWorkerOptions } from '../../config/config.constants';
import { LoansService } from '../../loans/loans.service';
import { QueueName } from '../queue-consumers.types';
import {
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from 'src/workspaces/workspaces.utils';

@Processor(QueueName.REJECT_PENDING_LOANS, defaultWorkerOptions)
export class RejectPendingLoansConsumer extends WorkerHost {
  constructor(private readonly service: LoansService) {
    super();
  }

  async process(job: Job<WithWorkspaceArgs>) {
    const { workspaceId } = withWorkspaceArgs(job.data);
    return this.service.rejectPendingLoans(workspaceId);
  }
}
