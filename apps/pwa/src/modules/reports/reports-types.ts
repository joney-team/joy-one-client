import { ProductType } from "@/graphql/types.graphql";
import { BookingRealtimeReport, BookingsReport } from "@/modules/bookings/booking-types";
import { CustomerRealtimeReport, CustomersReport } from "@/modules/customers/customer-types";
import { LoansRangReport, LoansRealtimeReport } from "@/modules/loans/loans-types";
import { ReceiptsRangeReport, ReceiptsRealtimeReport } from "@/modules/receipts/receipts-types";
import { TasksRealtimeReport, TasksReport } from "@/modules/tasks/tasks-types";
import { Period } from "@/types";

export enum ReportType {
  RANGE = "range",
  REALTIME = "realtime",
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
  loans: LoansRangReport;
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
  loans: LoansRealtimeReport;
  tasks: TasksRealtimeReport;
  receipts: ReceiptsRealtimeReport;
  customers: CustomerRealtimeReport;
  bookings: BookingRealtimeReport;
  capturedAt: number;
}
