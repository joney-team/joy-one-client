import { DashboardWidgetType } from "@/widgets/dashboard/types";
import { ReportWidgetType } from "@/widgets/reports/types";
import { tl } from "../lang/lang-service";
import type {
  WorkspaceView,
  WorkspaceViewComponent,
} from "../workspace-settings/workspace-settings-types";
import type { WorkspaceModule } from "./workspace-modules";
import { WorkspaceType } from "./workspaces-types";

const defaultWorkspaceView: WorkspaceView = {
  dashboardWidgets: [
    { id: "", type: DashboardWidgetType.TODAY_REVENUE },
    { id: "", type: DashboardWidgetType.TODAY_NEW_CUSTOMERS },
    { id: "", type: DashboardWidgetType.TODAY_BOOKINGS },
    { id: "", type: DashboardWidgetType.REVENUE_CHART },
    { id: "", type: DashboardWidgetType.NEW_CUSTOMERS_CHART },
    { id: "", type: DashboardWidgetType.BOOKINGS_CHART },
  ],
  menu: [
    { id: "", type: "MODULE", moduleId: "dashboard" },
    { id: "", type: "MODULE", moduleId: "tasks" },
    { id: "", type: "MODULE", moduleId: "customers" },
    { id: "", type: "MODULE", moduleId: "bookings" },
    { id: "", type: "MODULE", moduleId: "messageBoxes" },

    { id: "", type: "DIVIDER", dividerName: "activities" },
    { id: "", type: "MODULE", moduleId: "orders" },
    { id: "", type: "MODULE", moduleId: "receipts" },
    { id: "", type: "MODULE", moduleId: "promotions" },

    { id: "", type: "DIVIDER", dividerName: "business" },
    { id: "", type: "MODULE", moduleId: "products" },
    { id: "", type: "MODULE", moduleId: "productServices" },
    { id: "", type: "MODULE", moduleId: "productCombos" },
    { id: "", type: "MODULE", moduleId: "productStocks" },
    { id: "", type: "MODULE", moduleId: "posts" },

    { id: "", type: "DIVIDER", dividerName: "manage" },
    { id: "", type: "MODULE", moduleId: "partners" },
    { id: "", type: "MODULE", moduleId: "reports" },

    { id: "", type: "DIVIDER", dividerName: "hrm" },
    { id: "", type: "MODULE", moduleId: "timekeepings" },
  ],
  reportWidgets: [
    { id: "", type: ReportWidgetType.REVENUE },
    { id: "", type: ReportWidgetType.NEW_CUSTOMERS },
    { id: "", type: ReportWidgetType.TASKS },
    { id: "", type: ReportWidgetType.REVENUE_CHART },
    { id: "", type: ReportWidgetType.NEW_CUSTOMERS_CHART },
    { id: "", type: ReportWidgetType.LIST_PRODUCTS_SERVICE },
  ],
};

const workspaceDefaultViews: { [key in WorkspaceType]?: WorkspaceView } = {
  [WorkspaceType.SOFTWARE]: {
    dashboardWidgets: [
      { id: "", type: DashboardWidgetType.TASKS_TODO },
      { id: "", type: DashboardWidgetType.TASKS_PROCESSING },
      { id: "", type: DashboardWidgetType.TODAY_BOOKINGS },
      { id: "", type: DashboardWidgetType.TASKS_CHART },
      { id: "", type: DashboardWidgetType.TASKS_COMPLETED_RATE_CHART },
      { id: "", type: DashboardWidgetType.BOOKINGS_CHART },
    ],
    menu: [
      { id: "", type: "MODULE", moduleId: "dashboard" },
      { id: "", type: "MODULE", moduleId: "tasks" },
      { id: "", type: "MODULE", moduleId: "reports" },

      { id: "", type: "DIVIDER", dividerName: "customers" },
      { id: "", type: "MODULE", moduleId: "messageBoxes" },
      { id: "", type: "MODULE", moduleId: "customers" },
      { id: "", type: "MODULE", moduleId: "bookings" },
      { id: "", type: "MODULE", moduleId: "partners" },

      { id: "", type: "DIVIDER", dividerName: "hrm" },
      { id: "", type: "MODULE", moduleId: "timekeepings" },
      // { id: '', type: 'MODULE', moduleId: 'payrolls' },
    ],
    reportWidgets: [
      { id: "", type: ReportWidgetType.TASKS },
      { id: "", type: ReportWidgetType.TASKS_COMPLETED_RATES },
      { id: "", type: ReportWidgetType.NEW_CUSTOMERS },
      { id: "", type: ReportWidgetType.TASK_TIME_TRACKINGS },
    ],
  },
  [WorkspaceType.CREDIT]: {
    dashboardWidgets: [
      { id: "", type: DashboardWidgetType.TODAY_REVENUE },
      { id: "", type: DashboardWidgetType.TODAY_NEW_CUSTOMERS },
      { id: "", type: DashboardWidgetType.TODAY_BOOKINGS },

      { id: "", type: DashboardWidgetType.LOANS_DEBT_TOTAL },
      { id: "", type: DashboardWidgetType.LOANS_DEBT_NOT_DUE_YET },
      { id: "", type: DashboardWidgetType.LOANS_DEBT_OVERDUE },

      { id: "", type: DashboardWidgetType.LOANS_ACTIVATED_CONTRACTS },
      { id: "", type: DashboardWidgetType.LOANS_PENDING_CONTRACTS },
      { id: "", type: DashboardWidgetType.LOANS_OVERDUE_CONTRACTS },

      { id: "", type: DashboardWidgetType.LOANS_NEW_CONTRACTS_CHART },
      { id: "", type: DashboardWidgetType.LOANS_FULFILLED_AMOUNT_CHART },
      { id: "", type: DashboardWidgetType.REVENUE_CHART },
      { id: "", type: DashboardWidgetType.NEW_CUSTOMERS_CHART },
    ],
    menu: [
      { id: "", type: "MODULE", moduleId: "dashboard" },
      { id: "", type: "MODULE", moduleId: "loans" },
      { id: "", type: "MODULE", moduleId: "messageBoxes" },

      { id: "", type: "DIVIDER", dividerName: "customers" },
      { id: "", type: "MODULE", moduleId: "customers" },
      { id: "", type: "MODULE", moduleId: "bookings" },
      { id: "", type: "MODULE", moduleId: "customerKYCs" },
      { id: "", type: "MODULE", moduleId: "receipts" },

      { id: "", type: "DIVIDER", dividerName: "manage" },
      { id: "", type: "MODULE", moduleId: "loanAssetEstimations" },
      { id: "", type: "MODULE", moduleId: "tasks" },
      { id: "", type: "MODULE", moduleId: "reports" },

      { id: "", type: "DIVIDER", dividerName: "hrm" },
      { id: "", type: "MODULE", moduleId: "timekeepings" },
    ],
    reportWidgets: [
      { id: "", type: ReportWidgetType.REVENUE },
      { id: "", type: ReportWidgetType.NEW_CUSTOMERS },
      { id: "", type: ReportWidgetType.LOANS_NEW_CUSTOMERS_AND_FULFILLED },
      { id: "", type: ReportWidgetType.REVENUE_AVERAGE },
      { id: "", type: ReportWidgetType.LOANS_FULFILLED },
      { id: "", type: ReportWidgetType.LOANS_FULFILLED_NEW },

      { id: "", type: ReportWidgetType.LOANS_EXPENSE },
      { id: "", type: ReportWidgetType.LOANS_CAPITAL },
      { id: "", type: ReportWidgetType.LOANS_FEE },

      { id: "", type: ReportWidgetType.REVENUE_CHART },
      { id: "", type: ReportWidgetType.NEW_CUSTOMERS_CHART },
      { id: "", type: ReportWidgetType.LOANS_FULFILLED_AMOUNT_CHART },
      { id: "", type: ReportWidgetType.LOANS_NEW_CHART },

      { id: "", type: ReportWidgetType.LOANS_RECEIPTS },
    ],
  },
};

export const getDefaultWorkspaceView = (type?: WorkspaceType): WorkspaceView => {
  const view = workspaceDefaultViews[type ?? WorkspaceType.BUSINESS] ?? defaultWorkspaceView;

  return {
    ...view,
    menu: view.menu?.map(
      (v, i) =>
        ({
          ...v,
          id: i.toString(),
        } as WorkspaceViewComponent)
    ),
    reportWidgets:
      view.reportWidgets?.map((v, i) => ({
        ...v,
        id: i.toString(),
      })) ?? null,
    dashboardWidgets:
      view.dashboardWidgets?.map((v, i) => ({
        ...v,
        id: i.toString(),
      })) ?? null,
  };
};

export interface NavigationGroup {
  id: string;
  name?: string;
  moduleIds: string[];
}

export const getNavigationGroups = (cpns: WorkspaceViewComponent[], modules: WorkspaceModule[]) => {
  const groups: NavigationGroup[] = [{ id: "default", moduleIds: [] }];

  let pointedGroupIndex: number | undefined = undefined;

  for (const cpn of cpns) {
    if (cpn.type === "DIVIDER") {
      groups.push({
        id: cpn.id,
        name: tl(cpn.dividerName!),
        moduleIds: [],
      });
      pointedGroupIndex = groups.length - 1;
      continue;
    }

    if (!cpn.moduleId || !modules.find((v) => v.id === cpn.moduleId)) continue;

    if (pointedGroupIndex && groups[pointedGroupIndex]) {
      groups[pointedGroupIndex].moduleIds.push(cpn.moduleId);
      continue;
    }

    groups[0].moduleIds.push(cpn.moduleId);
  }

  return groups.filter((v) => v.moduleIds.length > 0);
};
