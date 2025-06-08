import { Coordinates } from "@/types";
import { LoanPayment, LoanSource, LoanStatus } from "./loans-types";

import { LoanAssetDataMap } from "./loans-types";

import { LoanAssetType } from "./loans-types";
import { ReceiptPaymentMethod } from "../receipts/receipts-types";

export interface CreateLoanDto<T extends LoanAssetType = any> {
  workspaceBranchId?: string;
  customerId: string;
  amount: number;
  assetType: LoanAssetType;
  assetData: LoanAssetDataMap[T];
  packageId: string;
  packagePeriodDays: number;
  payment: LoanPayment;
  coord?: Coordinates;
  source?: LoanSource;
}

export interface SignLoanDto {
  signature: string;
}

export interface UpdateLoanAmountDto {
  amount: number;
}

export interface RejectLoanDto {
  reason: string;
}

export interface GetPaymentPlanDto {
  packageId: string;
  amount: number;
  startTime?: number;
}

export interface UpdateLoanAssetDataDto {
  assetData: any;
}

export interface UpdateLoanPackageDto {
  packageId: string;
  packagePeriodDays: number;
}

export interface FulfillLoanDto {
  receiptFileIds: string[];
  paymentMethod: ReceiptPaymentMethod;
  fulfilledAt?: number | null;
}

export interface UpdateLoanWorkspaceBranchDto {
  workspaceBranchId: string | null;
  loanIds: string[];
}

export interface ImportLoanDto extends CreateLoanDto {
  code?: string;
  createdAt?: number;
  status?: LoanStatus;
  isRequireCustomerKyc?: boolean;
}