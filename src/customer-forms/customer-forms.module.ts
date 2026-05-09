import { forwardRef, Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { MongoEntities } from '../database/database.utils';
import { WorkspaceBranchesModule } from '../workspace-branches/workspace-branches.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { CustomerFormsController } from './customer-forms.controller';
import { CustomerFormEntity } from './customer-forms.entity';
import { CustomerFormsResolver } from './customer-forms.resolver';
import { CustomerFormsService } from './customer-forms.service';

@Module({
  imports: [
    MongoEntities(CustomerFormEntity),
    WorkspacesModule,
    WorkspaceBranchesModule,
    forwardRef(() => CustomersModule),
  ],
  providers: [CustomerFormsService, CustomerFormsResolver],
  controllers: [CustomerFormsController],
  exports: [CustomerFormsService],
})
export class CustomerFormsModule {}
