import { api } from "../apis";
import { BankTransactionCallbackDto, BankTransactionEntity, CreateBankTransactionDto } from "./bank-transaction-types";

export async function createBankTransaction(dto: CreateBankTransactionDto) {
  return api.post<BankTransactionEntity>(`/bank-transactions`, dto);
}

export async function bankTransactionCallback(dto: BankTransactionCallbackDto) {
  return api.post<BankTransactionEntity>('/bank-transactions/callback', dto);
}

export async function getBankTransaction(id: string) {
  return api.get<BankTransactionEntity>(`/bank-transactions/${id}`);
}