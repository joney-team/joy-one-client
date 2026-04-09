import { LoanAssetType } from "@/graphql/enums.graphql";
import { LoanLiquidationCalculated, LoanPaymentPeriod } from "@/graphql/types.graphql";
import { LoanFragment } from "./graphql/fragmentLoan.graphql";

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

export interface LoanAssetsMotobike extends LoanAssetVehicle {}

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
  [LoanAssetType.MotobikeRegistration]: LoanAssetsMotobike;
  [LoanAssetType.CarRegistration]: LoanAssetsCar;
  [LoanAssetType.BusinessPermit]: LoanAssetsBusinessPermit;
  [LoanAssetType.Icloud]: LoanAssetsICloud;
  [LoanAssetType.LandCertificate]: LoanAssetsLandCertificate;
};
// ======================= End Loan Asset Data =======================

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
  __typename: "LoanAssetEstimations";
  id: string;
  brands: LoanAssetEstimationBrand[];
  models: LoanAssetEstimationModel[];
  colors: LoanAssetEstimationColor[];
  estimations: LoanAssetEstimation[];
}

export interface LoansRealtimeReport {
  contracts: {
    activated: number;
    overdue: number;
    pending: number;
  };
  debt: {
    total: number;
    notDueYet: number;
    overdue: number;
  };
}

export interface LoansRangReport {
  newLoans: Pick<LoanFragment, "id" | "amount" | "customerId">[];
  fulfilledLoans: Pick<LoanFragment, "id" | "amount" | "customerId">[];
  contracts: {
    new: number;
    fulfilled: number;
    fulfilledAmount?: number;
  };
}

export interface LoanReceiptData {
  period?: LoanPaymentPeriod;
  partial?: boolean;
  remainPartial?: boolean;
  liquidation?: boolean;
  liquidationCalculated?: LoanLiquidationCalculated;
  liquidationReceiptIds?: string[];
  lateInterest?: {
    period: number;
    rate: number;
    days: number;
  };
}

export interface LoanReceiptReport {
  capital: number;
  fee: number;
  expense: number;
}
