import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { MongoEntities, PostgresEntities } from '../database/database.utils';
import { FilesModule } from '../files/files.module';
import { LoansModule } from '../loans/loans.module';
import { WorkspaceBranchesModule } from '../workspace-branches/workspace-branches.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { ReceiptEntity } from 'src/receipts/entities/receipt.entity';
import { FileExportEntity } from './entities/file-export.entity';
import { FileExportsController } from './file-exports.controller';
import { FileExportsResolver } from './file-exports.resolver';
import { FileExportsService } from './file-exports.service';
import { CreditReportProcessor } from './processors/credit-report.processor';

@Module({
  imports: [
    MongoEntities(FileExportEntity),
    PostgresEntities(ReceiptEntity),
    ReceiptsModule,
    LoansModule,
    CustomersModule,
    FilesModule,
    WorkspaceBranchesModule,
    WorkspaceMembersModule,
  ],
  controllers: [FileExportsController],
  providers: [FileExportsService, FileExportsResolver, CreditReportProcessor],
  exports: [FileExportsService, CreditReportProcessor],
})
export class FileExportsModule {}
