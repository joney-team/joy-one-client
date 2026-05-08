import { Period } from "@/graphql/types.graphql";
import type { AppRouter } from "@/hooks/use-router";
import { TimeSeriesReportFragment } from "@/modules/reports/graphql/fragmentTimeSeriesReport.graphql";
import { WorkspaceSettingFragment } from "@/modules/workspace-settings/graphql/fragmentWorkspaceSetting.graphql";
import type { WorkspaceContext } from "@/modules/workspaces/workspaces-types";
import { CurrencyData } from "@joy-one-client/utils/currency";

export enum ReportWidgetType {
  TASKS = "TASKS",
  TASKS_COMPLETED_RATES = "TASKS_COMPLETED_RATES",
  REVENUE = "REVENUE",
  REVENUE_AVERAGE = "REVENUE_AVERAGE",
  REVENUE_CHART = "REVENUE_CHART",
  NEW_CUSTOMERS = "NEW_CUSTOMERS",
  NEW_CUSTOMERS_CHART = "NEW_CUSTOMERS_CHART",
  LIST_PRODUCTS_SERVICE = "LIST_PRODUCTS_SERVICE",
  LOANS_RECEIPTS = "LOANS_RECEIPTS",
  LOANS_FULFILLED = "LOANS_FULFILLED",
  LOANS_NEW_CHART = "LOANS_NEW_CHART",
  LOANS_FEE = "LOANS_FEE",
  LOANS_CAPITAL = "LOANS_CAPITAL",
  LOANS_EXPENSE = "LOANS_EXPENSE",
  LOANS_FULFILLED_AMOUNT_CHART = "LOANS_FULFILLED_AMOUNT_CHART",
  LOANS_NEW_CUSTOMERS_AND_FULFILLED = "LOANS_NEW_CUSTOMERS_AND_FULFILLED",
  LOANS_FULFILLED_NEW = "LOANS_FULFILLED_NEW",
  CREDIT_FILE_EXPORTS = "CREDIT_FILE_EXPORTS",
}

export interface ReportWidgetsContext {
  isInitialized: boolean;
  isFetching: boolean;
  router: AppRouter;
  rangeReports: TimeSeriesReportFragment[];
  fromTime: number;
  toTime: number;
  period: Period;
  workspace: WorkspaceContext;
  workspaceSetting: WorkspaceSettingFragment;
  currency?: CurrencyData;
  workspaceBranchIds?: string[];
}
