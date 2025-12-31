import {
  reportConvertMoneyAmount,
  reportConvertMoneyAmountUnit,
} from "@/modules/reports/reports-utils";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { Period } from "@/types";
import { numberWidget, numberWidgetlayoutConfig } from "@/widgets/common/number.widget";
import { EWidgetModules } from "@/widgets/widgets-types";
import { DateTime } from "@joy-one-client/utils/date-time";
import { useLingui } from "@lingui/react/macro";
import {
  IconBusinessplan,
  IconCashRegister,
  IconChartBar,
  IconChartLine,
  IconCreativeCommonsSa,
  IconCreditCardPay,
  IconReport,
  IconReportMoney,
  IconStack,
  IconStack2,
  IconStopwatch,
  IconUsersPlus,
} from "@tabler/icons-react";
import { chartWidget, chartWidgetlayoutConfig } from "../common/chart.widget";
import { ReportWidgetsContext, ReportWidgetType } from "./types";
import { ReportCreditWidget } from "./widgets/report-credit.widget";
import { ReportProductsWidget } from "./widgets/report-products.widget";
import { ReportTimeTrackingsWidget } from "./widgets/report-time-trackings.widget";

export const useReportWidgetModules = (): {
  reportWidgetModules: EWidgetModules<ReportWidgetType, ReportWidgetsContext>;
} => {
  const { t } = useLingui();
  return {
    reportWidgetModules: {
      [ReportWidgetType.REVENUE]: {
        config: {
          name: () => t`Revenue`,
          icon: IconCashRegister,
          defaultState: {
            style: "dark-content",
          },
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          type: "money",
          isLoading: (ctx) => ctx.isFetching,
          renderValue: (ctx) => ctx.rangeReports.reduce((acc, v) => acc + v.receipts.revenue, 0),
          renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.receipts.revenue),
          boxColor: (ctx) => {
            const totalRevenue = ctx.rangeReports.reduce((acc, v) => acc + v.receipts.revenue, 0);
            return totalRevenue >= 0 ? "primary" : "red";
          },
        }),
      },
      [ReportWidgetType.REVENUE_AVERAGE]: {
        config: {
          name: () => t`Revenue average`,
          icon: IconCashRegister,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          type: "money",
          isLoading: (ctx) => ctx.isFetching,
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => acc + v.receipts.revenue, 0) /
            ctx.rangeReports.length,
          boxColor: (ctx) => {
            const averageRevenue =
              ctx.rangeReports.reduce((acc, v) => acc + v.receipts.revenue, 0) /
              ctx.rangeReports.length;
            return averageRevenue >= 0 ? "primary" : "red";
          },
        }),
      },
      [ReportWidgetType.REVENUE_CHART]: {
        config: {
          name: () => t`Revenue chart`,
          icon: IconChartBar,
          layout: chartWidgetlayoutConfig,
        },
        component: chartWidget({
          loading: (ctx) => ctx.isFetching,
          renderData: (ctx) =>
            ctx.rangeReports.map((v) => {
              const date = DateTime.normalizeDate(v.fromTime);
              return {
                date: date
                  ? ctx.period === Period.MONTH
                    ? date.getDate()
                    : `${date.getDate()}/${date.getMonth() + 1}`
                  : "-",
                value: reportConvertMoneyAmount(v.receipts.revenue, ctx.workspace.currency),
              };
            }),
          unit: (ctx) => reportConvertMoneyAmountUnit(ctx.workspace.currency),
          renderSeries: () => [{ name: "value", label: t`Revenue`, color: "primary.6" }],
        }),
      },
      [ReportWidgetType.NEW_CUSTOMERS_CHART]: {
        config: {
          name: () => t`New customers`,
          icon: IconChartBar,
          layout: chartWidgetlayoutConfig,
        },
        component: chartWidget({
          loading: (ctx) => ctx.isFetching,
          renderData: (ctx) =>
            ctx.rangeReports.map((v) => {
              const date = DateTime.normalizeDate(v.fromTime);
              return {
                date: date
                  ? ctx.period === Period.MONTH
                    ? date.getDate()
                    : `${date.getDate()}/${date.getMonth() + 1}`
                  : "-",
                value: v.customers.total,
              };
            }),
          renderSeries: () => [{ name: "value", label: t`New customers`, color: "primary.6" }],
        }),
      },
      [ReportWidgetType.NEW_CUSTOMERS]: {
        config: {
          name: () => t`New customers`,
          icon: IconUsersPlus,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          renderValue: (ctx) => ctx.rangeReports.reduce((acc, v) => acc + v.customers.total, 0),
          renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.customers.total),
        }),
      },
      [ReportWidgetType.TASKS]: {
        config: {
          name: () => t`Tasks`,
          icon: IconStack2,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          renderValue: (ctx) => ctx.rangeReports.reduce((acc, v) => acc + v.tasks.total, 0),
          renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.tasks.total),
        }),
      },
      [ReportWidgetType.TASKS_COMPLETED_RATES]: {
        config: {
          name: () => t`Tasks completed rate`,
          icon: IconStack2,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          unit: "%",
          isLoading: (ctx) => ctx.isFetching,
          renderValue: (ctx) => {
            const totalTasks = ctx.rangeReports.reduce((acc, v) => acc + v.tasks.total, 0);
            const totalCompletedTasks = ctx.rangeReports.reduce(
              (acc, v) => acc + v.tasks.completed,
              0
            );
            const tasksCompletedPercent =
              totalTasks > 0 ? (totalCompletedTasks / totalTasks) * 100 : 0;
            return tasksCompletedPercent;
          },
          renderSparkline: (ctx) => {
            return ctx.rangeReports.map((v) => v.tasks.completed);
          },
        }),
      },
      [ReportWidgetType.LIST_PRODUCTS_SERVICE]: {
        config: {
          name: () => t`Products services`,
          icon: IconStack,
          layout: {
            initH: 18,
            initW: 12,
            minW: 6,
            minH: 18,
          },
        },
        component: ReportProductsWidget,
      },
      [ReportWidgetType.TASK_TIME_TRACKINGS]: {
        config: {
          name: () => t`Tasks time trackings`,
          icon: IconStopwatch,
          layout: {
            initH: 12,
            initW: 12,
            minW: 6,
            minH: 12,
          },
        },
        component: ReportTimeTrackingsWidget,
      },
      [ReportWidgetType.LOANS_RECEIPTS]: {
        config: {
          workspaceTypes: [WorkspaceType.CREDIT],
          name: () => t`Credit report`,
          icon: IconReport,
          layout: {
            initH: 3,
            initW: 6,
            minW: 4,
            minH: 3,
          },
        },
        component: ReportCreditWidget,
      },
      [ReportWidgetType.LOANS_NEW_CHART]: {
        config: {
          workspaceTypes: [WorkspaceType.CREDIT],
          name: () => t`Loans new and fulfilled chart`,
          icon: IconChartLine,
          layout: chartWidgetlayoutConfig,
        },
        component: chartWidget({
          loading: (ctx) => ctx.isFetching,
          renderData: (ctx) =>
            ctx.rangeReports.map((v) => {
              const date = DateTime.normalizeDate(v.fromTime);
              return {
                date: date
                  ? ctx.period === Period.MONTH
                    ? date.getDate()
                    : `${date.getDate()}/${date.getMonth() + 1}`
                  : "-",
                value: v.loans.contracts.new,
                fulfilled: v.loans.contracts.fulfilled,
              };
            }),
          renderSeries: () => [
            { name: "value", label: t`New loan contracts`, color: "blue.6" },
            { name: "fulfilled", label: t`Loans fulfilled`, color: "primary.6" },
          ],
          unit: () => t`Loans`,
        }),
      },
      [ReportWidgetType.LOANS_FULFILLED_AMOUNT_CHART]: {
        config: {
          workspaceTypes: [WorkspaceType.CREDIT],
          name: () => t`Loans fulfilled amount chart`,
          icon: IconChartLine,
          layout: chartWidgetlayoutConfig,
        },
        component: chartWidget({
          loading: (ctx) => ctx.isFetching,
          renderData: (ctx) =>
            ctx.rangeReports.map((v) => {
              const date = DateTime.normalizeDate(v.fromTime);
              return {
                date: date
                  ? ctx.period === Period.MONTH
                    ? date.getDate()
                    : `${date.getDate()}/${date.getMonth() + 1}`
                  : "-",
                value: reportConvertMoneyAmount(
                  v.loans.contracts.fulfilledAmount || 0,
                  ctx.workspace.currency
                ),
              };
            }),
          unit: (ctx) => reportConvertMoneyAmountUnit(ctx.workspace.currency),
          renderSeries: () => [{ name: "value", label: t`Money amount`, color: "primary.6" }],
        }),
      },
      [ReportWidgetType.LOANS_FULFILLED]: {
        config: {
          workspaceTypes: [WorkspaceType.CREDIT],
          name: () => t`Loans fulfilled`,
          icon: IconCreditCardPay,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => acc + v.loans.contracts.fulfilled, 0),
          renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.loans.contracts.fulfilled),
        }),
      },
      [ReportWidgetType.LOANS_FEE]: {
        config: {
          workspaceTypes: [WorkspaceType.CREDIT],
          name: () => t`Report loans fee`,
          icon: IconBusinessplan,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          type: "money",
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => acc + (v.receipts.loanFee ?? 0), 0),
        }),
      },
      [ReportWidgetType.LOANS_CAPITAL]: {
        config: {
          workspaceTypes: [WorkspaceType.CREDIT],
          name: () => t`Report loans capital`,
          icon: IconCreativeCommonsSa,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          type: "money",
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => acc + (v.receipts.loanCapital ?? 0), 0),
        }),
      },
      [ReportWidgetType.LOANS_EXPENSE]: {
        config: {
          workspaceTypes: [WorkspaceType.CREDIT],
          name: () => t`Report loans expense`,
          icon: IconReportMoney,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          type: "money",
          renderValue: (ctx) =>
            -ctx.rangeReports.reduce((acc, v) => acc + (v.receipts.loanExpense ?? 0), 0),
        }),
      },
      [ReportWidgetType.LOANS_NEW_CUSTOMERS_AND_FULFILLED]: {
        config: {
          workspaceTypes: [WorkspaceType.CREDIT],
          name: () => t`New customers and fulfilled`,
          icon: IconUsersPlus,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => {
              const newCustomers = v.customers.newIds.filter((id) =>
                v.loans.fulfilledLoans.some((loan) => loan.customerId === id)
              );
              return acc + newCustomers.length;
            }, 0),
        }),
      },
      [ReportWidgetType.LOANS_FULFILLED_NEW]: {
        config: {
          workspaceTypes: [WorkspaceType.CREDIT],
          name: () => t`Loans fulfilled new`,
          icon: IconUsersPlus,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => {
              const newLoans = v.loans.fulfilledLoans.filter((loan) =>
                v.customers.newIds.includes(loan.customerId)
              );
              return acc + newLoans.length;
            }, 0),
        }),
      },
    },
  };
};
