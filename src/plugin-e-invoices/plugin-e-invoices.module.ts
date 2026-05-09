import { Module } from '@nestjs/common';
import { CustomerKycsModule } from '../customer-kycs/customer-kycs.module';
import { CustomersModule } from '../customers/customers.module';
import { MongoEntities } from '../database/database.utils';
import { LoansModule } from '../loans/loans.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { WorkspaceSettingsModule } from '../workspace-settings/workspace-settings.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { PluginEInvoicesEntity } from './entities/plugin-e-invoice.entity';
import { PluginEInvoiceProviderEntity } from './entities/plugin-e-invoice-provider.entity';
import { PluginEInvoicesResolver } from './plugin-e-invoices.resolver';
import { PluginEInvoicesService } from './plugin-e-invoices.service';
import { PluginEInvoiceProvidersResolver } from './plugin-e-invoice-providers.resolver';

@Module({
  imports: [
    MongoEntities(PluginEInvoiceProviderEntity, PluginEInvoicesEntity),
    ReceiptsModule,
    LoansModule,
    CustomersModule,
    CustomerKycsModule,
    WorkspacesModule,
    WorkspaceSettingsModule,
  ],
  providers: [
    PluginEInvoicesService,
    PluginEInvoicesResolver,
    PluginEInvoiceProvidersResolver,
  ],
  exports: [PluginEInvoicesService],
})
export class PluginEInvoicesModule {}
