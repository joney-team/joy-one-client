import { TimeSeriesReport } from "@/graphql/types.graphql";
import { AppRouter } from "@/hooks/use-router";
import { MetricsReportFragment } from "@/modules/reports/graphql/fragmentMetricsReport.graphql";
import { TimeSeriesReportFragment } from "@/modules/reports/graphql/fragmentTimeSeriesReport.graphql";
import { WorkspaceContext } from "@/modules/workspaces/workspaces-types";
import { UseFetch } from "@/utils/use-fetch.util";
import { CurrencyData } from "@joy-one/utils/currency";

export enum DashboardWidgetType {
  TODAY_REVENUE = "TODAY_REVENUE",
  TODAY_NEW_CUSTOMERS = "TODAY_NEW_CUSTOMERS",
  TODAY_BOOKINGS = "TODAY_BOOKINGS",

  LOANS_ACTIVATED_CONTRACTS = "LOANS_ACTIVATED_CONTRACTS",
  LOANS_OVERDUE_CONTRACTS = "LOANS_OVERDUE_CONTRACTS",
  LOANS_PENDING_CONTRACTS = "LOANS_PENDING_CONTRACTS",
  LOANS_DEBT_TOTAL = "LOANS_DEBT_TOTAL",
  LOANS_DEBT_NOT_DUE_YET = "LOANS_DEBT_NOT_DUE_YET",
  LOANS_DEBT_OVERDUE = "LOANS_DEBT_OVERDUE",
  LOANS_NEW_CONTRACTS_CHART = "LOANS_NEW_CONTRACTS_CHART",
  LOANS_FULFILLED_AMOUNT_CHART = "LOANS_FULFILLED_AMOUNT_CHART",

  REVENUE_CHART = "REVENUE_CHART",
  BOOKINGS_CHART = "BOOKINGS_CHART",
  NEW_CUSTOMERS_CHART = "NEW_CUSTOMERS_CHART",
  TASKS_TODO = "TASKS_TODO",
  TASKS_PROCESSING = "TASKS_PROCESSING",
  TASKS_CHART = "TASKS_CHART",
  TASKS_COMPLETED_RATE_CHART = "TASKS_COMPLETED_RATE_CHART",
}

export type TimeSeriesReports = {
  lastSyncedAt?: number;
  period: TimeSeriesReportFragment[];
  prevPeriod: TimeSeriesReportFragment[];
};

export interface DashboardWidgetsContext {
  router: AppRouter;
  metrics: MetricsReportFragment | null | undefined;
  isMetricsLoading: boolean;
  timeSeries: UseFetch<TimeSeriesReports>;
  workspace: WorkspaceContext;
  currency?: CurrencyData;
}
