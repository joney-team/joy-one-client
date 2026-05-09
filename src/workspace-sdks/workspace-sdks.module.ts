import { Module } from '@nestjs/common';
import { CustomerContactsModule } from '../customer-contacts/customer-contacts.module';
import { CustomerKycsModule } from '../customer-kycs/customer-kycs.module';
import { CustomersModule } from '../customers/customers.module';
import { MongoEntities } from '../database/database.utils';
import { LoansModule } from '../loans/loans.module';
import { PluginBanksModule } from '../plugin-banks/plugin-banks.module';
import { PluginZaloOAsModule } from '../plugin-zalo-oas/plugin-zalo-oas.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { WorkspaceSettingsModule } from '../workspace-settings/workspace-settings.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { WorkspaceSdksController } from './workspace-sdks.controller';
import { WorkspaceSdkEntity } from './workspace-sdks.entity';
import { WorkspaceSdksService } from './workspace-sdks.service';

@Module({
  providers: [WorkspaceSdksService],
  controllers: [WorkspaceSdksController],
  imports: [
    MongoEntities(WorkspaceSdkEntity),
    CustomersModule,
    CustomerKycsModule,
    CustomerContactsModule,
    LoansModule,
    PluginBanksModule,
    PluginZaloOAsModule,
    ReceiptsModule,
    WorkspacesModule,
    WorkspaceSettingsModule,
  ],
  exports: [WorkspaceSdksService],
})
export class WorkspaceSdksModule {}
