import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSONObject } from 'src/graphql/graphql-type';
import { LocationEntity } from '../locations/locations.types';

@ObjectType()
export class LoanPayment {
  @Field()
  accountName: string;

  @Field()
  accountNumber: string;

  @Field()
  accountBankId: number;
}

@InputType()
export class LoanPaymentInput {
  @Field()
  @IsString()
  accountName: string;

  @Field()
  @IsString()
  accountNumber: string;

  @Field()
  @IsNumber()
  accountBankId: number;
}

export enum LoanStatus {
  PENDING_SIGN = 'PENDING_SIGN',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

registerEnumType(LoanStatus, {
  name: 'LoanStatus',
  description: 'Available loan statuses',
});

export enum LoanAssetType {
  ICLOUD = 'ICLOUD',
  MOTOBIKE_REGISTRATION = 'MOTOBIKE_REGISTRATION',
  CAR_REGISTRATION = 'CAR_REGISTRATION',
  BUSINESS_PERMIT = 'BUSINESS_PERMIT',
  LAND_CERTIFICATE = 'LAND_CERTIFICATE',
}

registerEnumType(LoanAssetType, {
  name: 'LoanAssetType',
  description: 'Available loan asset types',
});

@ObjectType()
export class LoanPaymentPeriod {
  @Field()
  period: number;

  @Field()
  startTime: number;

  @Field()
  endTime: number;

  @Field()
  totalAmount: number;

  @Field()
  fee: number;

  @Field()
  capitalAmount: number;

  @Field()
  remainCapitalAmount: number;

  @Field({ nullable: true })
  note?: string;
}

// ======================= Start Loan Settings =======================
export enum LoanPackageType {
  FIXED_CAPITAL = 'FIXED_CAPITAL',
  UNFIXED_CAPITAL = 'UNFIXED_CAPITAL',
  INSTALLMENT = 'INSTALLMENT',
}

registerEnumType(LoanPackageType, {
  name: 'LoanPackageType',
});

@ObjectType()
export class LateInterestRate {
  @Field()
  lateDays: number;

  @Field()
  rate: number;
}

@InputType()
export class LateInterestRateInput {
  @Field()
  @IsNumber()
  lateDays: number;

  @Field()
  @IsNumber()
  rate: number;
}

@ObjectType()
export class LoanPackage {
  @Field()
  id: string;

  @Field(() => [LoanAssetType])
  assetTypes: LoanAssetType[];

  @Field(() => LoanPackageType)
  type: LoanPackageType;

  @Field({
    description:
      '1 tháng, 2 tháng, 3 tháng, 6 tháng, 12 tháng -> Quy đổi ra ngày',
  })
  days: number;

  @Field(() => [Number], { description: 'Số ngày trong kỳ vay (10, 15, 30)' })
  periodDaysOptions: number[];

  @Field({ description: 'Chi phí vay' })
  contractFee: number;

  @Field(() => [[Number]], { description: 'Tỷ lệ trả gốc' })
  unFixedCapitalRates: number[][];

  @Field(() => [LateInterestRate], { description: 'Lãi phạt' })
  lateInterestRates: LateInterestRate[];

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  liquidationFeeRate?: number;
}

@InputType()
export class LoanPackageInput {
  @Field()
  @IsString()
  id: string;

  @Field(() => [LoanAssetType])
  @IsArray()
  @IsEnum(LoanAssetType, { each: true })
  assetTypes: LoanAssetType[];

  @Field(() => LoanPackageType)
  @IsEnum(LoanPackageType)
  type: LoanPackageType;

  @Field({
    description:
      '1 tháng, 2 tháng, 3 tháng, 6 tháng, 12 tháng -> Quy đổi ra ngày',
  })
  @IsNumber()
  days: number;

  @Field(() => [Number], { description: 'Số ngày trong kỳ vay (10, 15, 30)' })
  @IsArray()
  @IsNumber({}, { each: true })
  periodDaysOptions: number[];

  @Field({ description: 'Chi phí vay' })
  @IsNumber()
  contractFee: number;

  @Field(() => [[Number]], { description: 'Tỷ lệ trả gốc' })
  @IsArray()
  unFixedCapitalRates: number[][];

  @Field(() => [LateInterestRateInput], { description: 'Lãi phạt' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LateInterestRateInput)
  lateInterestRates: LateInterestRateInput[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  liquidationFeeRate?: number;
}

@ObjectType()
export class LoanSettings {
  @Field(() => [LoanPackage])
  loanPackages?: LoanPackage[];

  @Field({ nullable: true })
  assetEstimationPriceSpreadRate?: number;

  @Field({ nullable: true })
  liquidationFeeRate?: number;

  @Field({ nullable: true })
  warningReceiptBeforeDays?: number;

  @Field({ nullable: true })
  contractPdfUrl?: string;

  @Field({ nullable: true })
  contractLiquidationPdfUrl?: string;

  @Field({ nullable: true })
  receiptPdfUrl?: string;

  @Field({ nullable: true })
  isAutoSelectWorkspaceBranch?: boolean;
}

@InputType()
export class LoanSettingsInput {
  @Field(() => [LoanPackageInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoanPackageInput)
  loanPackages?: LoanPackageInput[];

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  assetEstimationPriceSpreadRate?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  liquidationFeeRate?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  warningReceiptBeforeDays?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  contractPdfUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  contractLiquidationPdfUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  receiptPdfUrl?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isAutoSelectWorkspaceBranch?: boolean;
}

// ======================= End Loan Settings =======================

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

@ObjectType()
export class LoansMetricsReportContracts {
  @Field()
  activated: number;

  @Field()
  overdue: number;

  @Field()
  pending: number;
}

@ObjectType()
export class LoansMetricsReportDebt {
  @Field()
  total: number;

  @Field()
  notDueYet: number;

  @Field()
  overdue: number;
}

@ObjectType()
export class LoansMetricsReport {
  @Field(() => LoansMetricsReportContracts)
  contracts: LoansMetricsReportContracts;

  @Field(() => LoansMetricsReportDebt)
  debt: LoansMetricsReportDebt;
}

@ObjectType()
export class LoansTimeSeriesReportInformation {
  @Field()
  id: string;

  @Field()
  amount: number;

  @Field()
  customerId: string;
}

@ObjectType()
export class LoansTimeSeriesReportContracts {
  @Field()
  new: number;

  @Field()
  fulfilled: number;

  @Field()
  fulfilledAmount: number;
}

@ObjectType()
export class LoansTimeSeriesReport {
  @Field(() => [LoansTimeSeriesReportInformation])
  newLoans: LoansTimeSeriesReportInformation[];

  @Field(() => [LoansTimeSeriesReportInformation])
  fulfilledLoans: LoansTimeSeriesReportInformation[];

  @Field(() => LoansTimeSeriesReportContracts)
  contracts: LoansTimeSeriesReportContracts;
}

@ObjectType()
export class LoanLiquidationCalculated {
  @Field()
  capitalAmount: number;

  @Field()
  paidAmount: number;

  @Field()
  avancedPaymentAmount: number;

  @Field()
  remainCapitalAmount: number;

  @Field()
  remainCapitalAmountFeePercent: number;

  @Field()
  remainCapitalAmountFee: number;

  @Field()
  period: number;

  @Field()
  periodFeePerDay: number;

  @Field()
  periodFeeAmount: number;

  @Field()
  periodFeeDays: number;

  @Field()
  periodStartAt: number;

  @Field()
  feeAmount: number;

  @Field()
  lateInterestAmount: number;
}

export interface LoanEventData {
  id: string;
  code: string;
  amount: number;
}

@ObjectType()
export class LoanPaymentProgress {
  @Field()
  receiptId: string;

  @Field()
  amount: number;

  @Field({ nullable: true })
  time?: number;

  @Field()
  isCompleted: boolean;
}

@ObjectType()
export class LoanReceiptReport {
  @Field({ nullable: true })
  period: number | null;

  @Field()
  capital: number;

  @Field()
  fee: number;

  @Field()
  expense: number;
}

@ObjectType()
export class LoanMetadata {
  @Field({ nullable: true })
  cidNumber?: string | null | undefined;

  @Field(() => LocationEntity, { nullable: true })
  cidVnLocation?: LocationEntity | null | undefined;

  @Field(() => LocationEntity, { nullable: true })
  cidLocation?: LocationEntity | null | undefined;
}

@ObjectType()
export class LoanPaymentPlanResultPaymentPeriod {
  @Field()
  periodDays: number;

  @Field(() => [LoanPaymentPeriod])
  periods: LoanPaymentPeriod[];
}

@ObjectType()
export class LoanPaymentPlanResult {
  @Field(() => LoanPackage)
  loanPackage: LoanPackage;

  @Field(() => [LoanPaymentPlanResultPaymentPeriod])
  paymentPeriods: LoanPaymentPlanResultPaymentPeriod[];
}

@InputType()
export class CalculateLoanPaymentPlanInput {
  @Field()
  @IsString()
  packageId: string;

  @Field()
  @IsNumber()
  amount: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  startTime?: number;
}

@ObjectType()
export class LoanAssetEstimations {
  @Field()
  id: string;

  @Field(() => [GraphQLJSONObject])
  brands: any[];

  @Field(() => [GraphQLJSONObject])
  models: any[];

  @Field(() => [GraphQLJSONObject])
  colors: any[];

  @Field(() => [GraphQLJSONObject])
  estimations: any[];
}

@InputType()
export class SetLoanAssetEstimationsInput {
  @Field(() => [GraphQLJSONObject])
  @IsArray()
  brands: any[];

  @Field(() => [GraphQLJSONObject])
  @IsArray()
  models: any[];

  @Field(() => [GraphQLJSONObject])
  @IsArray()
  colors: any[];

  @Field(() => [GraphQLJSONObject])
  @IsArray()
  estimations: any[];
}
