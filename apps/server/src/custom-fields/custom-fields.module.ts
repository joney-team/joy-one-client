import { Global, Module } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CustomFieldsController } from './custom-fields.controller';
import { MongoEntities } from '../database/database.utils';
import { CustomFieldEntity } from './custom-fields.entity';
import { CustomFieldsResolver } from './custom-fields.resolver';

@Global()
@Module({
  providers: [CustomFieldsService, CustomFieldsResolver],
  controllers: [CustomFieldsController],
  imports: [
    MongoEntities(CustomFieldEntity),
  ],
  exports: [CustomFieldsService],
})
export class CustomFieldsModule { }
