import { Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { PrescriptionEntity } from './entities/prescription.entity';
import { PrescriptionsResolver } from './prescriptions.resolver';
import { PrescriptionsService } from './prescriptions.service';

@Module({
  providers: [PrescriptionsService, PrescriptionsResolver],
  imports: [MongoEntities(PrescriptionEntity)],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
