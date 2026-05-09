import { ArgsType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum BookingStatus {
  JUST_CREATED = 'JUST_CREATED',
  CHECK_IN = 'CHECK_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESCHEDULED = 'RESCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(BookingStatus, {
  name: 'BookingStatus',
  description: 'Booking statuses',
});

@ArgsType()
export class CreateBookingArgs {
  @Field({ nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  note?: string;

  @Field()
  @ApiProperty()
  @IsNumber()
  startTime: number;

  @Field()
  @ApiProperty()
  @IsNumber()
  endTime: number;

  @Field(() => BookingStatus)
  @ApiProperty()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @Field({ nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  reasonForCancellation?: string;

  @Field(() => [String], { nullable: true })
  @ApiProperty()
  @IsArray()
  @IsOptional()
  assigneeUserIds?: string[];

  @Field({ nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  customerId?: string;

  @Field({ nullable: true })
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  createdAt?: number;

  @Field({ nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  workspaceBranchId?: string;
}

@ArgsType()
export class UpdateBookingArgs {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => [String], { nullable: true })
  @ApiProperty()
  @IsArray()
  @IsOptional()
  assigneeUserIds?: string[];

  @Field({ nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  customerId?: string;
}

@ArgsType()
export class RescheduleBookingArgs extends CreateBookingArgs {
  @Field()
  @ApiProperty()
  @IsString()
  prevBookingId: string;
}

@ArgsType()
export class CancelBookingArgs {
  @Field()
  @IsString()
  id: string;

  @Field()
  @ApiProperty()
  @IsString()
  reason: string;
}

@ObjectType()
export class BookingsTimeSeriesReport {
  @Field()
  total: number;

  @Field()
  completed: number;

  @Field()
  canceled: number;

  @Field()
  transferred: number;

  @Field()
  inProgress: number;
}

export interface RemindBookingDto {
  bookingId: string;
}

export interface BookingEventData {
  customerName: string | null;
  customerCode: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  dateTime: number;
  bookingTitle: string | null;
  bookingNote: string | null;
  rejectedReason: string | null;
  assigneeUserIds: string[];
}

@ObjectType()
export class BookingsMetricsReport {
  @Field()
  todayCount: number;

  @Field()
  userBookingsCount: number;
}
