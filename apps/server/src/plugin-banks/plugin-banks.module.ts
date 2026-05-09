import { Global, Module } from '@nestjs/common';
import { PluginBanksController } from './plugin-banks.controller';
import { PluginBanksService } from './plugin-banks.service';
import { PluginBanksResolver } from './plugin-banks.resolver';

@Global()
@Module({
  controllers: [PluginBanksController],
  providers: [PluginBanksService, PluginBanksResolver],
  exports: [PluginBanksService],
})
export class PluginBanksModule {}
