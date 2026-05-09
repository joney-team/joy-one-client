import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { MongoEntities } from '../database/database.utils';
import { CustomerContactsController } from './customer-contacts.controller';
import { CustomerContactEntity } from './entities/customer-contact.entity';
import { CustomerContactsService } from './customer-contacts.service';
import { CustomerContactsResolver } from './customer-contacts.resolver';

@Module({
  providers: [CustomerContactsService, CustomerContactsResolver],
  controllers: [CustomerContactsController],
  imports: [MongoEntities(CustomerContactEntity), CustomersModule],
  exports: [CustomerContactsService],
})
export class CustomerContactsModule {}
