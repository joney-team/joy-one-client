import { BaseMongoEntity } from "@/types";

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

export interface CreateBankTransactionDto {
  type: BankTransactionType;
  paymentGateway: BankTransactionPaymentGateway;
  relatedReceiptId?: string;
  amount: number;
}

export interface BankTransactionEntity extends BaseMongoEntity {
  code: string;
  orderCode: number;
  workspaceId: string;
  amount: number;
  expiredAt: number;
  bankTransactionId?: string;
  relatedReceiptId?: string;
  paymentData?: any;
  paymentLinkId?: any;
  type: BankTransactionType;
  paymentGateway: BankTransactionPaymentGateway;
  status: BankTransactionStatus;
  isFulfilled?: boolean;
  failedReason?: string;
}

export interface BankTransactionCallbackDto {
  paymentLinkId?: string
}