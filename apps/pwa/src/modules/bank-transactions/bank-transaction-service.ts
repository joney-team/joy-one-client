import { MainRequest } from "../requests/main.request";
import { BankTransactionCallbackDto, BankTransactionEntity, CreateBankTransactionDto } from "./bank-transaction-types";

export async function createBankTransaction(dto: CreateBankTransactionDto) {
  return MainRequest.post<BankTransactionEntity>(`/bank-transactions`, dto);
}

export async function bankTransactionCallback(dto: BankTransactionCallbackDto) {
  return MainRequest.post<BankTransactionEntity>('/bank-transactions/callback', dto);
}

export async function getBankTransaction(id: string) {
  return MainRequest.get<BankTransactionEntity>(`/bank-transactions/${id}`);
}