import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { logger } from '../../app.logger';
import { defaultWorkerOptions } from '../../config/config.constants';
import { FileExportsService } from '../../file-exports/file-exports.service';
import { FileExportContextType, FileExportStatus, ProcessFileExportJobData } from '../../file-exports/file-exports.types';
import { CreditReportProcessor } from '../../file-exports/processors/credit-report.processor';
import { QueueName } from '../queue-consumers.types';

@Processor(QueueName.PROCESS_FILE_EXPORT, {
  ...defaultWorkerOptions,
  concurrency: 3,
  lockDuration: 600000,
})
export class ProcessFileExportConsumer extends WorkerHost {
  constructor(
    private readonly fileExports: FileExportsService,
    private readonly creditReportProcessor: CreditReportProcessor,
  ) {
    super();
  }

  async process(job: Job<ProcessFileExportJobData>) {
    const { exportId } = job.data;

    await this.fileExports.updateStatus({
      exportId,
      status: FileExportStatus.PROCESSING,
    });

    try {
      const entity = await this.fileExports.getEntityById(exportId);
      if (!entity) throw new Error(`FileExport ${exportId} not found`);

      let fileUrl: string;

      switch (entity.contextType) {
        case FileExportContextType.CREDIT_REPORT:
          fileUrl = await this.creditReportProcessor.process(entity);
          break;
        default:
          throw new Error(`Unsupported context type: ${entity.contextType}`);
      }

      await this.fileExports.updateStatus({
        exportId,
        status: FileExportStatus.FINISHED,
        fileUrl,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`[FileExport] Failed for ${exportId}: ${message}`);

      await this.fileExports.updateStatus({
        exportId,
        status: FileExportStatus.FAILED,
        error: message,
      });

      throw error;
    }
  }
}
