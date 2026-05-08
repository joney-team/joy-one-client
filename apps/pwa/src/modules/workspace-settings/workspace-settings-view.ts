import { WorkspaceType } from "@/graphql/enums.graphql";
import { WorkspaceView, WorkspaceViewComponent } from "@/graphql/types.graphql";
import { DashboardWidgetType } from "@/widgets/dashboard/types";
import { ReportWidgetType } from "@/widgets/reports/types";
import { WorkspaceModule } from "../workspaces/workspace-modules";

const defaultWorkspaceView: WorkspaceView = {
  __typename: "WorkspaceView",
  menu: [
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "dashboard",
      dividerName: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "tasks",
      dividerName: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "customers",
      dividerName: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "bookings",
      dividerName: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "messageBoxes",
      dividerName: null,
    },

    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "DIVIDER",
      moduleId: null,
      dividerName: "activities",
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "orders",
      dividerName: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "receipts",
      dividerName: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "promotions",
      dividerName: null,
    },

    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "DIVIDER",
      dividerName: "business",
      moduleId: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "products",
      dividerName: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "productServices",
      dividerName: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "productCombos",
      dividerName: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "productStocks",
      dividerName: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "posts",
      dividerName: null,
    },

    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "DIVIDER",
      dividerName: "manage",
      moduleId: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "MODULE",
      moduleId: "partners",
      dividerName: null,
    },
    {
      __typename: "WorkspaceViewComponent",
      id: "",
      type: "DIVIDER",
      dividerName: "hrm",
      moduleId: null,
    },
  ],
  dashboardWidgets: [
    { __typename: "DisplayWidget", id: "", type: DashboardWidgetType.TODAY_REVENUE, state: null },
    {
      __typename: "DisplayWidget",
      id: "",
      type: DashboardWidgetType.TODAY_NEW_CUSTOMERS,
      state: null,
    },
    { __typename: "DisplayWidget", id: "", type: DashboardWidgetType.TODAY_BOOKINGS, state: null },
    { __typename: "DisplayWidget", id: "", type: DashboardWidgetType.REVENUE_CHART, state: null },
    {
      __typename: "DisplayWidget",
      id: "",
      type: DashboardWidgetType.NEW_CUSTOMERS_CHART,
      state: null,
    },
    { __typename: "DisplayWidget", id: "", type: DashboardWidgetType.BOOKINGS_CHART, state: null },
  ],
  reportWidgets: [
    { __typename: "DisplayWidget", id: "", type: ReportWidgetType.REVENUE, state: null },
    { __typename: "DisplayWidget", id: "", type: ReportWidgetType.NEW_CUSTOMERS, state: null },
    { __typename: "DisplayWidget", id: "", type: ReportWidgetType.TASKS, state: null },
    { __typename: "DisplayWidget", id: "", type: ReportWidgetType.REVENUE_CHART, state: null },
    {
      __typename: "DisplayWidget",
      id: "",
      type: ReportWidgetType.NEW_CUSTOMERS_CHART,
      state: null,
    },
    {
      __typename: "DisplayWidget",
      id: "",
      type: ReportWidgetType.LIST_PRODUCTS_SERVICE,
      state: null,
    },
  ],
};

const workspaceDefaultViews: { [key in WorkspaceType]?: WorkspaceView } = {
  [WorkspaceType.Software]: {
    __typename: "WorkspaceView",
    menu: [
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "dashboard",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "tasks",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "reports",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "DIVIDER",
        dividerName: "customers",
        moduleId: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "messageBoxes",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "customers",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "bookings",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "partners",
        dividerName: null,
      },

      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "DIVIDER",
        dividerName: "hrm",
        moduleId: null,
      },
    ],
    dashboardWidgets: [
      { __typename: "DisplayWidget", id: "", type: DashboardWidgetType.TASKS_TODO, state: null },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.TASKS_PROCESSING,
        state: null,
      },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.TODAY_BOOKINGS,
        state: null,
      },
      { __typename: "DisplayWidget", id: "", type: DashboardWidgetType.TASKS_CHART, state: null },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.TASKS_COMPLETED_RATE_CHART,
        state: null,
      },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.BOOKINGS_CHART,
        state: null,
      },
    ],
    reportWidgets: [
      { __typename: "DisplayWidget", id: "", type: ReportWidgetType.TASKS, state: null },
      {
        __typename: "DisplayWidget",
        id: "",
        type: ReportWidgetType.TASKS_COMPLETED_RATES,
        state: null,
      },
      { __typename: "DisplayWidget", id: "", type: ReportWidgetType.NEW_CUSTOMERS, state: null },
    ],
  },
  [WorkspaceType.Credit]: {
    __typename: "WorkspaceView",
    dashboardWidgets: [
      { __typename: "DisplayWidget", id: "", type: DashboardWidgetType.TODAY_REVENUE, state: null },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.TODAY_NEW_CUSTOMERS,
        state: null,
      },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.TODAY_BOOKINGS,
        state: null,
      },

      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.LOANS_DEBT_TOTAL,
        state: null,
      },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.LOANS_DEBT_NOT_DUE_YET,
        state: null,
      },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.LOANS_DEBT_OVERDUE,
        state: null,
      },

      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.LOANS_ACTIVATED_CONTRACTS,
        state: null,
      },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.LOANS_PENDING_CONTRACTS,
        state: null,
      },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.LOANS_OVERDUE_CONTRACTS,
        state: null,
      },

      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.LOANS_NEW_CONTRACTS_CHART,
        state: null,
      },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.LOANS_FULFILLED_AMOUNT_CHART,
        state: null,
      },
      { __typename: "DisplayWidget", id: "", type: DashboardWidgetType.REVENUE_CHART, state: null },
      {
        __typename: "DisplayWidget",
        id: "",
        type: DashboardWidgetType.NEW_CUSTOMERS_CHART,
        state: null,
      },
    ],
    menu: [
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "dashboard",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "loans",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "messageBoxes",
        dividerName: null,
      },

      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "DIVIDER",
        dividerName: "customers",
        moduleId: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "customers",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "bookings",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "customerKYCs",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "receipts",
        dividerName: null,
      },

      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "DIVIDER",
        dividerName: "manage",
        moduleId: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "loanAssetEstimations",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "tasks",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "MODULE",
        moduleId: "reports",
        dividerName: null,
      },
      {
        __typename: "WorkspaceViewComponent",
        id: "",
        type: "DIVIDER",
        dividerName: "hrm",
        moduleId: null,
      },
    ],
    reportWidgets: [
      { __typename: "DisplayWidget", id: "", type: ReportWidgetType.REVENUE, state: null },
      { __typename: "DisplayWidget", id: "", type: ReportWidgetType.NEW_CUSTOMERS, state: null },
      {
        __typename: "DisplayWidget",
        id: "",
        type: ReportWidgetType.LOANS_NEW_CUSTOMERS_AND_FULFILLED,
        state: null,
      },
      { __typename: "DisplayWidget", id: "", type: ReportWidgetType.REVENUE_AVERAGE, state: null },
      { __typename: "DisplayWidget", id: "", type: ReportWidgetType.LOANS_FULFILLED, state: null },
      {
        __typename: "DisplayWidget",
        id: "",
        type: ReportWidgetType.LOANS_FULFILLED_NEW,
        state: null,
      },

      { __typename: "DisplayWidget", id: "", type: ReportWidgetType.LOANS_EXPENSE, state: null },
      { __typename: "DisplayWidget", id: "", type: ReportWidgetType.LOANS_CAPITAL, state: null },
      { __typename: "DisplayWidget", id: "", type: ReportWidgetType.LOANS_FEE, state: null },

      { __typename: "DisplayWidget", id: "", type: ReportWidgetType.REVENUE_CHART, state: null },
      {
        __typename: "DisplayWidget",
        id: "",
        type: ReportWidgetType.NEW_CUSTOMERS_CHART,
        state: null,
      },
      {
        __typename: "DisplayWidget",
        id: "",
        type: ReportWidgetType.LOANS_FULFILLED_AMOUNT_CHART,
        state: null,
      },
      { __typename: "DisplayWidget", id: "", type: ReportWidgetType.LOANS_NEW_CHART, state: null },
      {
        __typename: "DisplayWidget",
        id: "",
        type: ReportWidgetType.CREDIT_FILE_EXPORTS,
        state: null,
      },
    ],
  },
};

export const getDefaultWorkspaceView = (type?: WorkspaceType): WorkspaceView => {
  const view = workspaceDefaultViews[type ?? WorkspaceType.Business] ?? defaultWorkspaceView;

  return {
    ...view,
    menu: (view.menu ?? [])?.map((v, i) => ({
      ...v,
      id: i.toString(),
    })),
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
        name: cpn.dividerName ?? "",
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
