import { BasePostgresEntity, Coordinates } from "@/types";
import { CustomerShortInfo } from "../customers/customer-types";
import { LocationEntity } from "../locations/locations-types";

export interface LoanMetadata {
  cidNumber?: number;
  cidVnLocation?: LocationEntity;
  cidLocation?: LocationEntity;
}

export interface LoanPayment {
  accountName: string,
  accountNumber: string,
  accountBankId: string,
}

export enum LoanStatus {
  PENDING_SIGN = 'PENDING_SIGN',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED',
  OVERDUE = 'OVERDUE',
  COMPLETED = 'COMPLETED',
}

export enum LoanAssetType {
  ICLOUD = 'ICLOUD',
  MOTOBIKE_REGISTRATION = 'MOTOBIKE_REGISTRATION',
  CAR_REGISTRATION = 'CAR_REGISTRATION',
  BUSINESS_PERMIT = 'BUSINESS_PERMIT',
  LAND_CERTIFICATE = 'LAND_CERTIFICATE',
}

export enum LoanSource {
  COMMON = 'COMMON',
  IMPORT = 'IMPORT',
}

export interface LoanPaymentPeriod {
  period: number;
  startTime: number;
  endTime: number;
  totalAmount: number;
  fee: number;
  capitalAmount: number;
  remainCapitalAmount: number;
  note?: string;
}

export type LoanPaymentPeriods = {
  periodDays: number;
  periods: LoanPaymentPeriod[];
}[]

export interface LoanPaymentPlanResult {
  loanPackage: LoanPackage;
  paymentPeriods: LoanPaymentPeriods;
}

// ======================= Start Loan Asset Data =======================
interface LoanAssetData {
  images: string[];
}

interface LoanAssetVehicle extends LoanAssetData {
  numberPlate: string;
  frameNumber: string;
  engineNumber: string;
  registrationNumber: string;
  issuedDate: string;
  productManufacturingDate: string;
  brandId: string;
  modelId: string;
  driverLicenseImages: {
    front: string;
    back: string;
  };
}

export interface LoanAssetsMotobike extends LoanAssetVehicle { }

export interface LoanAssetsCar extends LoanAssetVehicle {
  receipts: string[];
}

export interface LoanAssetsBusinessPermit extends LoanAssetData {
  businessRegistrationNumber: string;
  taxCode: string;
}

export interface LoanAssetsLandCertificate extends LoanAssetData {
  images: string[];
}

export interface LoanAssetsICloud extends LoanAssetData {
  assetType: string;
  deviceName: string;
  storage: string;
  imeil: string;
  serial: string;
  deviceSecretKey: string;
}

export type LoanAssetDataMap = {
  [LoanAssetType.MOTOBIKE_REGISTRATION]: LoanAssetsMotobike;
  [LoanAssetType.CAR_REGISTRATION]: LoanAssetsCar;
  [LoanAssetType.BUSINESS_PERMIT]: LoanAssetsBusinessPermit;
  [LoanAssetType.ICLOUD]: LoanAssetsICloud;
  [LoanAssetType.LAND_CERTIFICATE]: LoanAssetsLandCertificate;
};
// ======================= End Loan Asset Data =======================

export interface LoanPaymentProgress {
  receiptId: string;
  amount: number;
  time?: number;
  isCompleted: boolean;
}

export interface LoanEntity<T extends LoanAssetType = any> extends BasePostgresEntity {
  customerId: string;
  customerPhone?: string;
  customer: CustomerShortInfo;
  workspaceId: string;
  code: string;
  amount: number;
  packageId: string;
  package: LoanPackage;
  packageDays: number;
  packagePeriodDays: number;
  paymentPeriods?: LoanPaymentPeriod[];
  assetType: LoanAssetType;
  assetData: LoanAssetDataMap[T];
  status: LoanStatus;
  rejectReason?: string;
  signature: string;
  payment: LoanPayment;
  coord?: Coordinates;
  disbursementReceiptRef: string;
  nextReceiptAt?: number;
  fulfilledAt?: number;
  paymentProgress?: LoanPaymentProgress[];
  isLiquidated?: boolean;
  isHasLateInterestReceipt?: boolean;
  source?: LoanSource;
  metadata?: LoanMetadata;
}

// ======================= Loan Asset Estimation =======================
export interface LoanAssetEstimationBrand {
  assetType: LoanAssetType;
  id: string;
  name: string;
}

export interface LoanAssetEstimationModel {
  id: string;
  name: string;
  brandId: string;
}

export interface LoanAssetEstimationColor {
  id: string;
  name: string;
  brandId: string;
}

export interface LoanAssetEstimation {
  id: string;
  assetType: LoanAssetType;
  brandId: string;
  modelId?: string;
  colorId?: string;
  productName?: string;
  productManufacturingDate?: number;
  productImages: string[];
  estimatePrice: number;
}

export interface LoanAssetEstimations {
  brands: LoanAssetEstimationBrand[];
  models: LoanAssetEstimationModel[];
  colors: LoanAssetEstimationColor[];
  estimations: LoanAssetEstimation[];
}

// ======================= Start Loan Settings =======================
export enum LoanPackageType {
  FIXED_CAPITAL = 'FIXED_CAPITAL', // CD1
  UNFIXED_CAPITAL = 'UNFIXED_CAPITAL', // CD2
  INSTALLMENT = 'INSTALLMENT', // Trả góp
}

export interface LateInterestRate {
  lateDays: number;
  rate: number;
}

export interface LoanPackage {
  id: string;
  description?: string;
  assetTypes: LoanAssetType[];
  type: LoanPackageType;
  days: number; // 1 tháng, 2 tháng, 3 tháng, 6 tháng, 12 tháng -> Quy đổi ra ngày
  periodDaysOptions: number[]; // Số ngày trong kỳ vay (10, 15, 30)
  contractFee: number; //  Chi phí vay
  unFixedCapitalRates: (number[])[]; // Tỷ lệ trả gốc
  lateInterestRates: LateInterestRate[] // Lãi phạt
  liquidationFeeRate?: number;
}

export interface LoanSettings {
  loanPackages?: LoanPackage[];
  assetEstimationPriceSpreadRate?: number;
  liquidationFeeRate?: number;
  warningReceiptBeforeDays?: number;
  contractPdfUrl?: string;
  contractLiquidationPdfUrl?: string;
  isAutoSelectWorkspaceBranch?: boolean;
  receiptPdfUrl?: string;
  isAutoArchivePendingLoans?: boolean;
}
// ======================= End Loan Settings =======================

export interface LoansRealtimeReport {
  contracts: {
    activated: number;
    overdue: number;
    pending: number;
  },
  debt: {
    total: number;
    notDueYet: number;
    overdue: number;
  },
}

export interface LoansRangReport {
  newLoans: Pick<LoanEntity, 'id' | 'amount' | 'customerId'>[];
  fulfilledLoans: Pick<LoanEntity, 'id' | 'amount' | 'customerId'>[];
  contracts: {
    new: number;
    fulfilled: number;
    fulfilledAmount?: number;
  }
}

export interface LoanLiquidationCalculated {
  capitalAmount: number
  paidAmount: number
  avancedPaymentAmount: number
  remainCapitalAmount: number
  remainCapitalAmountFeePercent: number
  remainCapitalAmountFee: number
  period: number
  periodFeeAmount: number
  periodFeeDays: number
  periodStartAt: number
  periodFeePerDay: number
  feeAmount: number
  lateInterestAmount: number
}

export interface LoanReceiptData {
  period?: LoanPaymentPeriod,
  partial?: boolean,
  remainPartial?: boolean,
  liquidation?: boolean,
  liquidationCalculated?: LoanLiquidationCalculated,
  liquidationReceiptIds?: string[],
  lateInterest?: {
    period: number,
    rate: number,
    days: number,
  },
}

export interface LoanReceiptReport {
  capital: number;
  fee: number;
  expense: number;
}