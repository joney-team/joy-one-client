import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReportsService } from '../../reports/reports.service';
import { ExportReportByRangeTimeInput } from '../../reports/reports.types';
import { QueueName } from '../queue-consumers.types';
import { defaultWorkerOptions } from '../../config/config.constants';

@Processor(QueueName.EXPORT_TIME_SERIES_REPORT, {
  ...defaultWorkerOptions,
  concurrency: 5,
  lockDuration: 600000,
})
export class ExportTimeSeriesReportConsumer extends WorkerHost {
  constructor(private readonly service: ReportsService) {
    super();
  }

  async process(job: Job<ExportReportByRangeTimeInput>) {
    return this.service.exportTimeSeries({ ...job.data, forceUpdate: true });
  }
}
