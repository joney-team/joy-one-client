import { Global, Module } from '@nestjs/common';
import { TimesResolver } from './times.resolver';

@Global()
@Module({
  providers: [TimesResolver],
})
export class TimesModule {}
