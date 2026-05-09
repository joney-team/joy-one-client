import { Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { DeviceEntity } from './devices.entity';
import { DevicesResolver } from './devices.resolver';
import { DevicesService } from './devices.service';

@Module({
  providers: [DevicesService, DevicesResolver],
  imports: [MongoEntities(DeviceEntity)],
  exports: [DevicesService],
})
export class DevicesModule {}
