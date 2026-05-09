import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { CacheService } from 'src/cache/cache.service';
import {
  BankInforationsResult,
  BankInformation,
  GetBankAccountInformationInput,
  GetBankAccountInformationResult,
} from './plugin-banks.types';

@Injectable()
export class PluginBanksService {
  constructor(private readonly cache: CacheService) {}

  async getBankInformations(): Promise<BankInforationsResult> {
    const instance = this.cache.instance({
      instanceKey: 'bank-informations-v2',
      config: { expireTime: 60 * 60 * 24 * 30 },
      fallback: async () => {
        const res = await axios
          .get(`https://api.vietqr.io/v2/banks`)
          .catch((error) => {
            throw new HttpException(error.response || error, 500);
          });

        const infos = [...res.data.data];

        return {
          total: infos.length,
          results: infos,
        };
      },
    });

    return instance.get('list');
  }

  async getBankInformation(
    bankId: number,
  ): Promise<BankInformation | undefined> {
    const banks = await this.getBankInformations();
    return banks.results.find((bank) => bank.id === bankId);
  }

  async getBankAccountInformation(
    input: GetBankAccountInformationInput,
  ): Promise<GetBankAccountInformationResult> {
    const instance = this.cache.instance({
      instanceKey: `bank-account-information`,
      config: { expireTime: 60 * 60 * 24 * 30 },
      fallback: async () => {
        const res = await axios
          .post(
            `https://api.vietqr.io/v2/lookup`,
            {
              bin: input.bin,
              accountNumber: input.accountNumber,
            },
            {
              headers: {
                'x-client-id': 'c16436c5-0a3f-4be5-9d78-5c06b426dd5a',
                'x-api-key': '73e43a78-fcd4-4dda-8781-1a7f6ece1b36',
              },
            },
          )
          .catch((error) => {
            throw new HttpException(error.response || error, 500);
          });

        return res.data.data;
      },
    });

    return instance.get(`${input.bin}-${input.accountNumber}`);
  }
}
