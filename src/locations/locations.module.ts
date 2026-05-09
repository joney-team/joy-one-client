import { Global, Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsResolver } from './locations.resolver';

@Global()
@Module({
  controllers: [LocationsController],
  providers: [LocationsResolver],
})
export class LocationsModule {}
