import { Period, WorkspaceType } from "@/graphql/enums.graphql";
import {
  reportConvertMoneyAmount,
  reportConvertMoneyAmountUnit,
} from "@/modules/reports/reports-utils";
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
  IconUsersPlus,
} from "@tabler/icons-react";
import { chartWidget, chartWidgetlayoutConfig } from "../common/chart.widget";
import { ReportWidgetsContext, ReportWidgetType } from "./types";
import { ReportCreditFileExportsWidget } from "./widgets/report-credit-file-exports.widget";
import { ReportProductsWidget } from "./widgets/report-products.widget";

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
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => acc + v.data.receipts.revenue, 0),
          renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.data.receipts.revenue),
          boxColor: (ctx) => {
            const totalRevenue = ctx.rangeReports.reduce(
              (acc, v) => acc + v.data.receipts.revenue,
              0,
            );
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
            ctx.rangeReports.reduce((acc, v) => acc + v.data.receipts.revenue, 0) /
            ctx.rangeReports.length,
          boxColor: (ctx) => {
            const averageRevenue =
              ctx.rangeReports.reduce((acc, v) => acc + v.data.receipts.revenue, 0) /
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
                  ? ctx.period === Period.Month
                    ? date.getDate()
                    : `${date.getDate()}/${date.getMonth() + 1}`
                  : "-",
                value: reportConvertMoneyAmount(v.data.receipts.revenue, ctx.currency),
              };
            }),
          unit: (ctx) => reportConvertMoneyAmountUnit(ctx.currency),
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
                  ? ctx.period === Period.Month
                    ? date.getDate()
                    : `${date.getDate()}/${date.getMonth() + 1}`
                  : "-",
                value: v.data.customers.total,
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
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => acc + v.data.customers.total, 0),
          renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.data.customers.total),
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
          renderValue: (ctx) => ctx.rangeReports.reduce((acc, v) => acc + v.data.tasks.total, 0),
          renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.data.tasks.total),
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
            const totalTasks = ctx.rangeReports.reduce((acc, v) => acc + v.data.tasks.total, 0);
            const totalCompletedTasks = ctx.rangeReports.reduce(
              (acc, v) => acc + v.data.tasks.completed,
              0,
            );
            const tasksCompletedPercent =
              totalTasks > 0 ? (totalCompletedTasks / totalTasks) * 100 : 0;
            return tasksCompletedPercent;
          },
          renderSparkline: (ctx) => {
            return ctx.rangeReports.map((v) => v.data.tasks.completed);
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
      [ReportWidgetType.CREDIT_FILE_EXPORTS]: {
        config: {
          workspaceTypes: [WorkspaceType.Credit],
          name: () => t`Export credit report`,
          icon: IconReport,
          layout: {
            initH: 10,
            initW: 6,
            minH: 10,
            minW: 6,
          },
        },
        component: ReportCreditFileExportsWidget,
      },
      [ReportWidgetType.LOANS_NEW_CHART]: {
        config: {
          workspaceTypes: [WorkspaceType.Credit],
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
                  ? ctx.period === Period.Month
                    ? date.getDate()
                    : `${date.getDate()}/${date.getMonth() + 1}`
                  : "-",
                value: v.data.loans.contracts.new,
                fulfilled: v.data.loans.contracts.fulfilled,
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
          workspaceTypes: [WorkspaceType.Credit],
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
                  ? ctx.period === Period.Month
                    ? date.getDate()
                    : `${date.getDate()}/${date.getMonth() + 1}`
                  : "-",
                value: reportConvertMoneyAmount(
                  v.data.loans.contracts.fulfilledAmount || 0,
                  ctx.currency,
                ),
              };
            }),
          unit: (ctx) => reportConvertMoneyAmountUnit(ctx.currency),
          renderSeries: () => [{ name: "value", label: t`Money amount`, color: "primary.6" }],
        }),
      },
      [ReportWidgetType.LOANS_FULFILLED]: {
        config: {
          workspaceTypes: [WorkspaceType.Credit],
          name: () => t`Loans fulfilled`,
          icon: IconCreditCardPay,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => acc + v.data.loans.contracts.fulfilled, 0),
          renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.data.loans.contracts.fulfilled),
        }),
      },
      [ReportWidgetType.LOANS_FEE]: {
        config: {
          workspaceTypes: [WorkspaceType.Credit],
          name: () => t`Report loans fee`,
          icon: IconBusinessplan,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          type: "money",
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => acc + (v.data.receipts.loanFee ?? 0), 0),
        }),
      },
      [ReportWidgetType.LOANS_CAPITAL]: {
        config: {
          workspaceTypes: [WorkspaceType.Credit],
          name: () => t`Report loans capital`,
          icon: IconCreativeCommonsSa,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          type: "money",
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => acc + (v.data.receipts.loanCapital ?? 0), 0),
        }),
      },
      [ReportWidgetType.LOANS_EXPENSE]: {
        config: {
          workspaceTypes: [WorkspaceType.Credit],
          name: () => t`Report loans expense`,
          icon: IconReportMoney,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          type: "money",
          renderValue: (ctx) =>
            -ctx.rangeReports.reduce((acc, v) => acc + (v.data.receipts.loanExpense ?? 0), 0),
        }),
      },
      [ReportWidgetType.LOANS_NEW_CUSTOMERS_AND_FULFILLED]: {
        config: {
          workspaceTypes: [WorkspaceType.Credit],
          name: () => t`New customers and fulfilled`,
          icon: IconUsersPlus,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => {
              const newCustomers = v.data.customers.newIds.filter((id) =>
                v.data.loans.fulfilledLoans.some((loan) => loan.customerId === id),
              );
              return acc + newCustomers.length;
            }, 0),
        }),
      },
      [ReportWidgetType.LOANS_FULFILLED_NEW]: {
        config: {
          workspaceTypes: [WorkspaceType.Credit],
          name: () => t`Loans fulfilled new`,
          icon: IconUsersPlus,
          layout: numberWidgetlayoutConfig,
        },
        component: numberWidget({
          isLoading: (ctx) => ctx.isFetching,
          renderValue: (ctx) =>
            ctx.rangeReports.reduce((acc, v) => {
              const newLoans = v.data.loans.fulfilledLoans.filter((loan) =>
                v.data.customers.newIds.includes(loan.customerId),
              );
              return acc + newLoans.length;
            }, 0),
        }),
      },
    },
  };
};
