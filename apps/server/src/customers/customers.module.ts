import { forwardRef, Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { CustomersController } from './customers.controller';
import { CustomerEntity } from './customers.entity';
import { CustomersService } from './customers.service';
import { PluginZaloOAsModule } from '../plugin-zalo-oas/plugin-zalo-oas.module';
import { WorkspaceBranchesModule } from '../workspace-branches/workspace-branches.module';
import { CustomersResolver } from './customers.resolver';

@Module({
  imports: [
    MongoEntities(CustomerEntity),
    forwardRef(() => WorkspaceMembersModule),
    forwardRef(() => WorkspaceBranchesModule),
    forwardRef(() => PluginZaloOAsModule),
  ],
  providers: [CustomersService, CustomersResolver],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
