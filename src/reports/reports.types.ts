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
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RawObjectId } from 'src/database/database.utils';
import { GraphQLJSONObject } from 'src/graphql/graphql-type';
import { Period } from '../app.types';
import {
  BookingsMetricsReport,
  BookingsTimeSeriesReport,
} from '../bookings/bookings.types';
import {
  CustomersMetricsReport,
  CustomersTimeSeriesReport,
} from '../customers/customers.types';
import {
  LoansMetricsReport,
  LoansTimeSeriesReport,
} from '../loans/loans.types';
import { OrdersMetricsReport } from '../orders/orders.types';
import { ProductType } from '../products/products.types';
import {
  ReceiptsMetricsReport,
  ReceiptsTimeSeriesReport,
} from '../receipts/receipts.types';
import {
  TasksMetricsReport,
  TasksTimeSeriesReport,
} from '../tasks/tasks.types';

export interface ProductReport {
  productId: string;
  productName: string;
  productType: ProductType;
  revenue: number;
  profit: number;
  qtySold: number;
}

export class ExportReportByRangeTimeInput {
  @IsString()
  workspaceId: any;

  @IsNumber()
  fromTime: number;

  @IsNumber()
  toTime: number;

  @IsOptional()
  @IsString()
  userId?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workspaceBranchIds?: string[];

  @IsOptional()
  @IsBoolean()
  forceUpdate?: boolean;
}

@ObjectType()
export class CombineTimeSeriesReport {
  @Field()
  fromTime: number;

  @Field()
  toTime: number;

  @Field(() => CustomersTimeSeriesReport)
  customers: CustomersTimeSeriesReport;

  @Field(() => BookingsTimeSeriesReport)
  bookings: BookingsTimeSeriesReport;

  @Field(() => ReceiptsTimeSeriesReport)
  receipts: ReceiptsTimeSeriesReport;

  @Field(() => TasksTimeSeriesReport)
  tasks: TasksTimeSeriesReport;

  @Field(() => LoansTimeSeriesReport)
  loans: LoansTimeSeriesReport;
}

@InputType()
export class ExportTimeSeriesReportInput {
  @Field(() => Period)
  @IsEnum(Period)
  period: Period;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  userId?: RawObjectId;

  @Field()
  @IsNumber()
  fromTime: number;

  @Field()
  @IsNumber()
  toTime: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workspaceBranchIds?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  forceUpdate?: boolean;
}

@InputType()
export class CaptureTimeSeriesReportInput {
  @Field()
  @IsString()
  workspaceId: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  query?: any;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  time?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;
}

@InputType()
export class ReportTimeSeriesInput {
  @Field()
  @IsNumber()
  fromTime: number;

  @Field()
  @IsNumber()
  toTime: number;
}

export class SyncWorkspaceReportsInput {
  @IsString()
  workspaceId: string;

  @Type(() => ReportTimeSeriesInput)
  @ValidateNested()
  @IsOptional()
  timeRange?: ReportTimeSeriesInput;

  @IsString()
  @IsOptional()
  triggerBy?: string;
}

export class SyncReportInput {
  @IsString()
  reportId: string;

  @IsString()
  @IsOptional()
  triggerBy?: string;
}

@ObjectType()
export class CombineMetricsReport {
  @Field(() => LoansMetricsReport)
  loans: LoansMetricsReport;

  @Field(() => TasksMetricsReport)
  tasks: TasksMetricsReport;

  @Field(() => ReceiptsMetricsReport)
  receipts: ReceiptsMetricsReport;

  @Field(() => CustomersMetricsReport)
  customers: CustomersMetricsReport;

  @Field(() => BookingsMetricsReport)
  bookings: BookingsMetricsReport;

  @Field(() => OrdersMetricsReport)
  orders: OrdersMetricsReport;
}

export enum ReportType {
  TIME_SERIES = 'TIME_SERIES',
  METRICS = 'METRICS',
}

registerEnumType(ReportType, {
  name: 'ReportType',
  description: 'Report types',
});

export enum ReportStatus {
  JUST_CREATED = 'just_created',
  SYNCED = 'synced',
  SYNCING = 'syncing',
}

registerEnumType(ReportStatus, {
  name: 'ReportStatus',
  description: 'Report status values',
});
