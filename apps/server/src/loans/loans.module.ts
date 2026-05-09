import { forwardRef, Module } from '@nestjs/common';
import { CustomerKycsModule } from '../customer-kycs/customer-kycs.module';
import { CustomersModule } from '../customers/customers.module';
import { PostgresEntities } from '../database/database.utils';
import { ReceiptsModule } from '../receipts/receipts.module';
import { WorkspaceSettingsModule } from '../workspace-settings/workspace-settings.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { LoansController } from './loans.controller';
import { LoanEntity } from './entities/loan.entity';
import { LoansService } from './loans.service';
import { WorkspaceBranchesModule } from '../workspace-branches/workspace-branches.module';
import { FilesModule } from '../files/files.module';
import { CustomerFormsModule } from '../customer-forms/customer-forms.module';
import { LoansResolver } from './loans.resolver';
import { WorkspaceMembersModule } from 'src/workspace-members/workspace-members.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  controllers: [LoansController],
  providers: [LoansService, LoansResolver],
  imports: [
    PostgresEntities(LoanEntity),
    CustomerKycsModule,
    CustomersModule,
    WorkspaceSettingsModule,
    WorkspaceMembersModule,
    NotificationsModule,
    FilesModule,
    forwardRef(() => WorkspacesModule),
    forwardRef(() => WorkspaceBranchesModule),
    forwardRef(() => ReceiptsModule),
    forwardRef(() => CustomerFormsModule),
  ],
  exports: [LoansService],
})
export class LoansModule {}
