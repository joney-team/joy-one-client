import { Query, Resolver } from '@nestjs/graphql';
import { VnLocation } from './locations.types';
import { getVnLocations } from './locations.utils';

@Resolver()
export class LocationsResolver {
  @Query(() => [VnLocation])
  getVnLocations() {
    const { data } = getVnLocations();
    return data;
  }
}
