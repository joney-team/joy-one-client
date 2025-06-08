import { BasePostgresEntity } from "./database";
import { CustomerShortInfo } from "./customers";
import { WorkspaceMemberInfo } from "./workspace-members";
import { Query } from "./database";
import { ProductType } from "./products";

export enum ReceiptType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum ReceiptPaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  BANK_CARD = 'BANK_CARD',
}

export enum ReceiptStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export interface CreateReceiptDto {
  ref?: string;
  amount: number;
  type: ReceiptType;
  note?: string;
  assigneeUserIds?: string[];
  relatedCustomerId?: string;
  relatedLoanId?: string;
  data?: any;
  expireAt?: number;
}

export interface UpdateReceiptDto {
  amount: number;
  data?: any;
  expireAt?: number;
  note?: string;
  cashierUserId?: string;
  assigneeUserIds?: string[];
  tipAmount?: number;
  relatedCustomerId?: string;
  paymentMethod?: ReceiptPaymentMethod;
  paidAt?: number;
}

export interface PayReceiptDto {
  paymentMethod?: ReceiptPaymentMethod;
  giveAmount?: number;
}

export class DisbursementReceiptDto {
  paymentMethod?: ReceiptPaymentMethod;
  ref?: string;
}

export interface ReceiptEntity<T = any> extends BasePostgresEntity {
  code: string;
  ref?: string;
  workspaceId: string;
  amount: number;
  type: ReceiptType;
  paidAt: number;
  giveAmount?: number;
  relatedLoanId?: string;
  relatedLoanCode?: string;
  relatedCustomerId?: string;
  relatedCustomer?: CustomerShortInfo;
  relatedOrderId?: string;
  cashierUserId?: string;
  cashierUser?: WorkspaceMemberInfo;
  assigneeUserIds: string[];
  status: ReceiptStatus;
  paymentMethod?: ReceiptPaymentMethod;
  disbursementUserId?: string;
  disbursementUser?: WorkspaceMemberInfo;
  note?: string;
  tipAmount?: number;
  expireAt?: number;
  data?: T;
  dataChanged?: ReceiptDataChanged;
}

export interface QueryReceipts extends Query {
  relatedTicketId?: string | string[];
  relatedCustomerId?: string | string[];
  relatedLoanId?: string | string[];
  cashierUserId?: string | string[];
  assigneeUserIds?: string | string[];
  status?: ReceiptStatus | ReceiptStatus[];
  fromTime?: number;
  toTime?: number;
  type?: ReceiptType | ReceiptType[];
  amount?: number;
  tipAmount?: number;
  ref?: string;
}

export interface ReceiptProductReport {
  productId: string;
  productName: string;
  productType: ProductType;
  revenue: number;
  profit: number;
  qtySold: number;
}

export interface ReceiptReportItem {
  ref: string;
  time: number;
  userId?: string;
  relatedEntities: {
    type: 'PRODUCT' | 'TICKET' | 'RECEIPT' | 'CUSTOMER' | 'ORDER',
    data: any,
  }[];
  revenue: number;
  profit: number;
}

export interface ReceiptsRangeReport {
  revenue: number,
  totalRevenue: number,
  totalProfit: number,
  totalReceipts: number,
  items: ReceiptReportItem[],
  loanCapital?: number | null,
  loanFee?: number | null,
  loanExpense?: number | null,
}

export interface PartialPaymentDto {
  amount: number;
  nextExpireAt?: number;
}

export interface ReceiptDataChanged {
  amount?: boolean;
  paymentMethod?: boolean;
}

export interface ReceiptsRealtimeReport {
  revenueToday: number;
}
