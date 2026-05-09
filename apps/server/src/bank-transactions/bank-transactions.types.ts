import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export interface CassoTransactionInformation {
  id: number;
  tid: string;
  description: string;
  amount: number;
  cusum_balance: number;
  when: string;
  bank_sub_acc_id: string;
  subAccId: string;
  bankName: string;
  bankAbbreviation: string;
  virtualAccount?: string;
  virtualAccountName?: string;
  corresponsiveName?: string;
  corresponsiveAccount?: string;
  corresponsiveBankId?: string;
  corresponsiveBankName?: string;
}

export enum BankTransactionPaymentGateway {
  PAY_OS = 'PAY_OS',
}

export enum BankTransactionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum BankTransactionType {
  WORKSPACE_BILLINGS_DEPOSIT = 'WORKSPACE_BILLINGS_DEPOSIT',
}

export class CreateBankTransactionDto {
  @IsEnum(BankTransactionType)
  type: BankTransactionType;

  @IsEnum(BankTransactionPaymentGateway)
  paymentGateway: BankTransactionPaymentGateway;

  @IsString()
  @IsOptional()
  relatedReceiptId?: string;

  @IsNumber()
  amount: number;
}

export class BankTransactionCallbackDto {
  @IsString()
  @IsOptional()
  paymentLinkId?: string;
}
