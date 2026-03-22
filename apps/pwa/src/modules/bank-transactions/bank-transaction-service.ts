import { restClient } from "../apis/rest-client";
import {
  BankTransactionCallbackDto,
  BankTransactionEntity,
  CreateBankTransactionDto,
} from "./bank-transaction-types";

export async function createBankTransaction(dto: CreateBankTransactionDto) {
  return restClient.post<BankTransactionEntity>(`/bank-transactions`, dto);
}

export async function bankTransactionCallback(dto: BankTransactionCallbackDto) {
  return restClient.post<BankTransactionEntity>("/bank-transactions/callback", dto);
}

export async function getBankTransaction(id: string) {
  return restClient.get<BankTransactionEntity>(`/bank-transactions/${id}`);
}
