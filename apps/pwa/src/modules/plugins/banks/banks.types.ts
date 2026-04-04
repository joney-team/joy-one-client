import { BankInformation } from "@/graphql/types.graphql";

export interface BankAccount {
  bankId: number;
  accountNumber: string;
  accountName?: string;
}

export interface BankQrCode {
  url: string;
  bank: BankInformation;
  account: BankAccount;
}
