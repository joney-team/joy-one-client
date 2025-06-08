import { BaseMongoEntity } from "./database";
import { ProductType } from "./products";
import { CustomerRealtimeReport, CustomersReport } from "./customers";

import { BookingRealtimeReport, BookingsReport } from "./bookings";
import { ReceiptsRealtimeReport } from "./receipts";
import { TasksRealtimeReport } from "./tasks";
import { ReceiptsRangeReport } from "./receipts";
import { TasksReport } from "./tasks";
import { Period } from "./general";

export enum ReportType {
  RANGE = 'range',
  REALTIME = 'realtime',
}

export interface ProductReport {
  productId: string;
  productName: string;
  productType: ProductType;
  revenue: number;
  profit: number;
  qtySold: number;
}

export interface RangeReport {
  capturedAt: number;
  fromTime: number;
  toTime: number;
  customers: CustomersReport;
  bookings: BookingsReport;
  receipts: ReceiptsRangeReport;
  tasks: TasksReport;
}

export interface ExportPeriodReportDto {
  period: Period;
  userId?: string;
  fromTime: number;
  toTime: number;
  forceUpdate?: boolean;
  workspaceBranchIds?: string[];
}

export interface RealtimeReport {
  tasks: TasksRealtimeReport;
  receipts: ReceiptsRealtimeReport;
  customers: CustomerRealtimeReport;
  bookings: BookingRealtimeReport;
  capturedAt: number;
}

export interface ReportEntity<T extends RangeReport | RealtimeReport> extends BaseMongoEntity {
  type: ReportType;
  ref: string;
  workspaceId: string;
  workspaceBranchIds?: string[];
  userId?: string;
  data: T;
}
