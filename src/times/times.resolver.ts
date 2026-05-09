import { Query, Resolver } from '@nestjs/graphql';
import { TimeZone } from './times.types';
import { timeZones } from './times.assets';

@Resolver()
export class TimesResolver {
  @Query(() => [TimeZone])
  async getTimeZones() {
    return timeZones;
  }
}
