import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { RelatedEntityInput } from '../database/database.entities';
import { GraphQLAnyType, GraphQLJSONObject } from '../graphql/graphql-type';
import { LoanReceiptReport } from '../loans/loans.types';
import { ProductType } from '../products/products.types';

export enum ReceiptType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

registerEnumType(ReceiptType, {
  name: 'ReceiptType',
  description: 'Receipt type',
});

export enum ReceiptStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

registerEnumType(ReceiptStatus, {
  name: 'ReceiptStatus',
  description: 'Receipt status',
});

export enum ReceiptPaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  BANK_CARD = 'BANK_CARD',
}

registerEnumType(ReceiptPaymentMethod, {
  name: 'ReceiptPaymentMethod',
  description: 'Receipt payment method',
});

@InputType()
export class CreateReceiptInput {
  @Field()
  @IsNumber()
  amount: number;

  @Field(() => ReceiptType)
  @IsEnum(ReceiptType)
  type: ReceiptType;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ref?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  tipAmount?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  relatedTicketId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  relatedOrderId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  relatedCustomerId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  relatedLoanId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  relatedPartnerId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => GraphQLAnyType, { nullable: true })
  @IsObject()
  @IsOptional()
  data?: any;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  assigneeUserIds?: string[];

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  expireAt?: number;

  @Field(() => [RelatedEntityInput], { nullable: true })
  @IsArray()
  @IsOptional()
  relatedEntities?: RelatedEntityInput[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  workspaceBranchId?: string;
}

@InputType()
export class PayReceiptInput {
  @Field(() => ReceiptPaymentMethod, { nullable: true })
  @IsEnum(ReceiptPaymentMethod)
  @IsOptional()
  paymentMethod?: ReceiptPaymentMethod;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  giveAmount?: number;
}

@InputType()
export class DisburseReceiptInput {
  @Field(() => ReceiptPaymentMethod, { nullable: true })
  @IsEnum(ReceiptPaymentMethod)
  @IsOptional()
  paymentMethod?: ReceiptPaymentMethod;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  relatedCustomerId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  relatedLoanId?: string;
}

export interface ReceiptProductReport {
  productId: string;
  productName: string;
  productType: ProductType;
  revenue: number;
  profit: number;
  qtySold: number;
}

@ObjectType()
export class ReceiptReportRelatedEntity {
  @Field(() => String)
  type:
    | 'PRODUCT'
    | 'TICKET'
    | 'RECEIPT'
    | 'LOAN'
    | 'CUSTOMER'
    | 'ORDER'
    | 'PRODUCT_COMBO';

  @Field(() => GraphQLAnyType)
  data: any;
}

@ObjectType()
export class ReceiptReportItem {
  @Field()
  ref: string;

  @Field()
  time: number;

  @Field({ nullable: true })
  userId?: string;

  @Field(() => [ReceiptReportRelatedEntity])
  relatedEntities: ReceiptReportRelatedEntity[];

  @Field()
  revenue: number;

  @Field()
  profit: number;

  @Field(() => LoanReceiptReport, { nullable: true })
  loan?: LoanReceiptReport;
}

@ObjectType()
export class ReceiptsTimeSeriesReport {
  @Field()
  revenue: number;

  @Field()
  totalRevenue: number;

  @Field()
  totalProfit: number;

  @Field()
  totalReceipts: number;

  @Field(() => [ReceiptReportItem])
  items: ReceiptReportItem[];

  @Field()
  loanCapital: number;

  @Field()
  loanFee: number;

  @Field()
  loanExpense: number;
}

@InputType()
export class PartialPaymentInput {
  @Field()
  @IsNumber()
  amount: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  nextExpireAt?: number;
}

export class UpdateReceiptWorkspaceBranchDto {
  @IsString()
  @IsOptional()
  workspaceBranchId?: string;
}

@InputType()
export class UpdateReceiptInput {
  @Field()
  @IsNumber()
  amount: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  data?: any;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  expireAt?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cashierUserId?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  assigneeUserIds?: string[];

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  tipAmount?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  relatedCustomerId?: string;

  @Field(() => ReceiptPaymentMethod, { nullable: true })
  @IsEnum(ReceiptPaymentMethod)
  @IsOptional()
  paymentMethod?: ReceiptPaymentMethod;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  paidAt?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isFixedAmount?: boolean;
}

export class UpdateReceiptPaidAtDto {
  @IsNumber()
  paidAt: number;
}

export interface ReceiptDataChanged {
  amount?: boolean;
  paymentMethod?: boolean;
}

@ObjectType()
export class ReceiptsMetricsReport {
  @Field()
  revenueToday: number;
}

export interface ReceiptEventData {
  code: string;
  money: number;
  cashier: string | null;
  customer: string | null;
  note: string | null;
  type: ReceiptType;
}
