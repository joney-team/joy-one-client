export interface BankInformation {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
}

export interface BankAccount {
  bankId: number,
  accountNumber: string,
  accountName?: string,
}

export interface BankQrCode {
  url: string;
  bank: BankInformation;
  account: BankAccount;
}