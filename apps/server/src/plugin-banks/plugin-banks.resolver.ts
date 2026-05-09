import { Args, Query, Resolver } from '@nestjs/graphql';
import { PluginBanksService } from './plugin-banks.service';
import {
  BankInforationsResult,
  BankInformation,
  GetBankAccountInformationInput,
  GetBankAccountInformationResult,
} from './plugin-banks.types';

@Resolver()
export class PluginBanksResolver {
  constructor(private readonly service: PluginBanksService) {}

  @Query(() => BankInforationsResult)
  async getBankInformations(): Promise<BankInforationsResult> {
    return this.service.getBankInformations();
  }

  @Query(() => BankInformation, { nullable: true })
  async getBankInformation(
    @Args('bankId') bankId: number,
  ): Promise<BankInformation | undefined> {
    return this.service.getBankInformation(bankId);
  }

  @Query(() => GetBankAccountInformationResult)
  async getBankAccountInformation(
    @Args('input') input: GetBankAccountInformationInput,
  ): Promise<GetBankAccountInformationResult> {
    return this.service.getBankAccountInformation(input);
  }
}
