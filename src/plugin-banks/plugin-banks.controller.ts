import { Body, Controller, Get, Post } from '@nestjs/common';
import { PluginBanksService } from './plugin-banks.service';
import { GetBankAccountInformationInput } from './plugin-banks.types';
import { ApiTags } from '@nestjs/swagger';

@Controller('plugins/banks')
@ApiTags('Plugin Banks')
export class PluginBanksController {
  constructor(private service: PluginBanksService) {}

  @Get()
  async getBankInformation() {
    return this.service.getBankInformations();
  }

  @Post('/account')
  async getBankAccount(@Body() dto: GetBankAccountInformationInput) {
    return this.service.getBankAccountInformation(dto);
  }
}
