import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export enum WorkspaceBillingStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export enum WorkspaceBillingType {
  PAYMENT = 'PAYMENT',
  CASHBACK = 'CASHBACK',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export class WorkspaceBillingDepositDto {
  manualSettlementByUserId?: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  relatedBankTransactionId?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class WorkspaceBillingWithdrawDto {
  @IsNumber()
  amount: number;
}

export class WorkspaceBillingPaymentDto {
  @IsNumber()
  amount: number;

  @IsBoolean()
  @IsOptional()
  isOnNotification?: boolean;

  @IsString()
  @IsOptional()
  relatedWorkspaceSubscriptionId?: string;

  @IsObject()
  @IsOptional()
  data?: any;

  @IsString()
  @IsOptional()
  note?: string;
}

export class WorkspaceBillingCashbackDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  relatedWorkspaceSubscriptionId?: string;
}

export interface WorkspaceBalance {
  balance: number;
  pendingPayment: number;
}
