import { Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { PartnersController } from './partners.controller';
import { PartnerEntity } from './partners.entity';
import { PartnersService } from './partners.service';
import { PartnersResolver } from './partners.resolver';

@Module({
  controllers: [PartnersController],
  providers: [PartnersService, PartnersResolver],
  imports: [MongoEntities(PartnerEntity)],
  exports: [PartnersService],
})
export class WorkspacePartnersModule {}
