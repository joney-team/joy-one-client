import { BaseMongoEntity } from "@/types";
import { WorkspaceEntity } from "../workspaces/workspaces-types";

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

export interface WorkspaceBillingDepositDto {
  amount: number;
  note?: string;
}

export interface WorkspaceBillingWithdrawDto {
  amount: number;
}

export interface WorkspaceBillingPaymentDto {
  amount: number;
  autoPayment?: boolean;
  note?: string;
}

export interface WorkspaceBillingEntity extends BaseMongoEntity {
  code: string;
  transactionId?: string;
  note?: string;
  amount: number;
  balance: number;
  workspaceId: string;
  workspace: WorkspaceEntity;
  manualSettlementByUserId?: string;
  type: WorkspaceBillingType;
  status: WorkspaceBillingStatus;
  isArchived?: boolean;
}

export interface WorkspaceBalance {
  balance: number;
  pendingPayment: number;
}

export interface BillingBankAccount {
  accountName: string;
  accountNumber: string;
  accountBankId: string;
}