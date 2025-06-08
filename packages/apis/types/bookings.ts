import { BaseMongoEntity, Query } from "./database";
import { CustomerShortInfo } from "./customers";

export enum BookingStatus {
  JUST_CREATED = 'JUST_CREATED',
  CHECK_IN = 'CHECK_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESCHEDULED = 'RESCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateBookingDto {
  title?: string;
  note?: string;
  customerId?: string;
  assigneeUserIds?: string[];
  startTime: number;
  endTime: number;
  status: BookingStatus;
  prevBookingId?: string;
}

export interface UpdateBookingDto {
  note?: string;
}

export interface RescheduleBookingDto extends CreateBookingDto {
  prevBookingId: string;
}

export interface BookingEntity extends BaseMongoEntity {
  title?: string;
  code: string;
  customerId?: string;
  customer?: CustomerShortInfo;
  reasonForCancellation?: string;
  workspaceId: string;
  startTime: number;
  endTime: number;
  note?: string;
  status: BookingStatus;
}

export interface QueryBookings extends Query {
  customerId?: string;
  assigneeUserIds?: string[];
  status?: BookingStatus[];
  fromTime?: number;
  toTime?: number;
  orderStartTime?: number;
}

export interface BookingsReport {
  total: number,
  completed: number,
  canceled: number,
  transferred: number,
  inProgress: number,
}

export interface BookingRealtimeReport {
  todayCount: number
}