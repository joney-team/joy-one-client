import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EntitySource } from '../app.types';
import { GraphQLJSONObject } from '../graphql/graphql-type';
import { CoordinatesInput } from '../locations/locations.types';
import { ReceiptPaymentMethod } from '../receipts/receipts.types';
import { LoanAssetType, LoanPaymentInput, LoanStatus } from './loans.types';

@InputType()
export class CreateLoanInput {
  @Field()
  @IsString()
  customerId: string;

  @Field()
  @IsNumber()
  amount: number;

  @Field(() => LoanAssetType)
  @IsEnum(LoanAssetType)
  assetType: LoanAssetType;

  @Field()
  @IsString()
  packageId: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  packagePeriodDays?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  assetData?: any;

  @Field(() => LoanPaymentInput, { nullable: true })
  @ValidateNested()
  @Type(() => LoanPaymentInput)
  @IsOptional()
  payment?: LoanPaymentInput;

  @Field(() => CoordinatesInput, { nullable: true })
  @ValidateNested()
  @Type(() => CoordinatesInput)
  @IsOptional()
  coord?: CoordinatesInput;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  workspaceBranchId?: string;

  @Field(() => EntitySource, { nullable: true })
  @IsEnum(EntitySource)
  @IsOptional()
  source?: EntitySource;
}

export class ImportLoanInput extends CreateLoanInput {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  createdAt?: number;

  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;

  @IsBoolean()
  @IsOptional()
  isRequireCustomerKyc?: boolean;
}

export class BulkCreateLoanDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLoanInput)
  loans: CreateLoanInput[];
}

@InputType()
export class SignLoanInput {
  @Field()
  @IsString()
  signature: string;
}

@InputType()
export class UpdateLoanAmountInput {
  @Field()
  @IsNumber()
  amount: number;
}

@InputType()
export class UpdateLoanPackageInput {
  @Field()
  @IsString()
  packageId: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  packagePeriodDays?: number;
}

@InputType()
export class UpdateLoanAssetDataInput {
  @Field(() => GraphQLJSONObject)
  @IsObject()
  assetData: any;
}

@InputType()
export class RejectLoanInput {
  @Field()
  @IsString()
  reason: string;
}

export class CalculatePaymentPlanDto {
  @ApiProperty()
  @IsString()
  packageId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  startTime?: number;
}

@InputType()
export class FulfillLoanInput {
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  receiptFileIds: string[];

  @Field(() => ReceiptPaymentMethod)
  @IsEnum(ReceiptPaymentMethod)
  paymentMethod: ReceiptPaymentMethod;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  fulfilledAt?: number;
}

@InputType()
export class BulkArchiveLoansInput {
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  loanIds: string[];
}

@InputType()
export class BulkRejectLoanInput {
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  loanIds: string[];

  @Field()
  @IsString()
  reason: string;
}

@InputType()
export class BulkRevertRejectLoanInput {
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  loanIds: string[];
}
