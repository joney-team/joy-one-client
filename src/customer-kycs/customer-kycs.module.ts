import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { MongoEntities } from '../database/database.utils';
import { CustomerKycsController } from './customer-kycs.controller';
import { CustomerKycEntity } from './customer-kycs.entity';
import { CustomerKycsService } from './customer-kycs.service';
import { CustomerKycsResolver } from './customer-kycs.resolver';

@Module({
  controllers: [CustomerKycsController],
  providers: [CustomerKycsService, CustomerKycsResolver],
  imports: [MongoEntities(CustomerKycEntity), CustomersModule],
  exports: [CustomerKycsService],
})
export class CustomerKycsModule {}
