import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import {
  crawlVnLocations,
  getLocations,
  getVnLocations,
  migrateVnLocation,
} from './locations.utils';
import { ApiTags } from '@nestjs/swagger';
import { LocationEntity } from './locations.types';
import { Auth } from '../app.decorators';
import { UserRole } from '../users/users.types';

@Controller('locations')
@ApiTags('Locations')
export class LocationsController {
  @Get()
  getLocations() {
    return getLocations();
  }

  @Get('/vn')
  getVnLocations() {
    return getVnLocations();
  }

  @Post('/vn/convert')
  async convertAddress(@Body() body: LocationEntity) {
    return migrateVnLocation(body);
  }

  @Patch('/crawls/vn-locations')
  @Auth({ userRoles: [UserRole.SYS_ADMIN] })
  async crawlVnLocations() {
    return crawlVnLocations();
  }
}
