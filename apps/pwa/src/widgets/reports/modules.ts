import { Period } from "@/types";
import { t } from "@/modules/lang/lang-service";
import { reportConvertMoneyAmount, reportConvertMoneyAmountUnit } from "@/modules/reports/reports-utils";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { numberWidget, numberWidgetlayoutConfig } from "@/widgets/common/number.widget";
import { EWidgetModules } from "@/widgets/types";
import {
  IconBusinessplan,
  IconCashRegister, IconChartBar, IconChartLine, IconCreativeCommonsSa, IconCreditCardPay,
  IconReport,
  IconReportMoney,
  IconStack, IconStack2, IconStopwatch, IconUsersPlus
} from "@tabler/icons-react";
import { chartWidget, chartWidgetlayoutConfig } from "../common/chart.widget";
import { ReportWidgetsContext, ReportWidgetType } from "./types";
import { ReportCreditWidget } from "./widgets/report-credit.widget";
import { ReportProductsWidget } from "./widgets/report-products.widget";
import { ReportTimeTrackingsWidget } from "./widgets/report-time-trackings.widget";

export const reportWidgetModules: EWidgetModules<ReportWidgetType, ReportWidgetsContext> = {
  [ReportWidgetType.REVENUE]: {
    config: {
      name: 'revenue',
      icon: IconCashRegister,
      defaultState: {
        style: 'dark-content'
      },
      layout: numberWidgetlayoutConfig,
    },
    component: numberWidget({
      type: 'money',
      isLoading: (ctx) => ctx.isFetching,
      renderValue: (ctx) => ctx.rangeReports.reduce((acc, v) => acc + v.receipts.revenue, 0),
      renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.receipts.revenue),
      boxColor: (ctx) => {
        const totalRevenue = ctx.rangeReports.reduce((acc, v) => acc + v.receipts.revenue, 0);
        return totalRevenue >= 0 ? 'primary' : 'red';
      }
    })
  },
  [ReportWidgetType.REVENUE_CHART]: {
    config: {
      name: 'revenue_chart',
      icon: IconChartBar,
      layout: chartWidgetlayoutConfig,
    },
    component: chartWidget({
      loading: (ctx) => ctx.isFetching,
      renderData: (ctx) => ctx.rangeReports.map((v) => {
        const date = DateTimeUtils.secondsToTime(v.fromTime);
        return ({
          date: date ? ctx.period === Period.MONTH ? date.getDate() : `${date.getDate()}/${date.getMonth() + 1}` : '-',
          value: reportConvertMoneyAmount(v.receipts.revenue, ctx.workspace.currency),
        })
      }),
      unit: (ctx) => reportConvertMoneyAmountUnit(ctx.workspace.currency),
      renderSeries: () => [
        { name: 'value', label: t('revenue'), color: 'primary.6' },
      ]
    }),
  },
  [ReportWidgetType.NEW_CUSTOMERS_CHART]: {
    config: {
      name: 'new_customers',
      icon: IconChartBar,
      layout: chartWidgetlayoutConfig,
    },
    component: chartWidget({
      loading: (ctx) => ctx.isFetching,
      renderData: (ctx) => ctx.rangeReports.map((v) => {
        const date = DateTimeUtils.secondsToTime(v.fromTime);
        return ({
          date: date ? ctx.period === Period.MONTH ? date.getDate() : `${date.getDate()}/${date.getMonth() + 1}` : '-',
          value: v.customers.total,
        })
      }),
      renderSeries: () => [
        { name: 'value', label: t('new_customers'), color: 'primary.6' },
      ],
    }),
  },
  [ReportWidgetType.NEW_CUSTOMERS]: {
    config: {
      name: 'new_customers',
      icon: IconUsersPlus,
      layout: numberWidgetlayoutConfig,
    },
    component: numberWidget({
      isLoading: (ctx) => ctx.isFetching,
      renderValue: (ctx) => ctx.rangeReports.reduce((acc, v) => acc + v.customers.total, 0),
      renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.customers.total),
    })
  },
  [ReportWidgetType.TASKS]: {
    config: {
      name: 'tasks',
      icon: IconStack2,
      layout: numberWidgetlayoutConfig,
    },
    component: numberWidget({
      isLoading: (ctx) => ctx.isFetching,
      renderValue: (ctx) => ctx.rangeReports.reduce((acc, v) => acc + v.tasks.total, 0),
      renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.tasks.total),
    })
  },
  [ReportWidgetType.TASKS_COMPLETED_RATES]: {
    config: {
      name: 'tasks_completed_rate',
      icon: IconStack2,
      layout: numberWidgetlayoutConfig,
    },
    component: numberWidget({
      unit: '%',
      isLoading: (ctx) => ctx.isFetching,
      renderValue: (ctx) => {
        const totalTasks = ctx.rangeReports.reduce((acc, v) => acc + v.tasks.total, 0);
        const totalCompletedTasks = ctx.rangeReports.reduce((acc, v) => acc + v.tasks.completed, 0);
        const tasksCompletedPercent = totalTasks > 0 ? (totalCompletedTasks / totalTasks) * 100 : 0;
        return tasksCompletedPercent;
      },
      renderSparkline: (ctx) => {
        return ctx.rangeReports.map((v) => v.tasks.completed);
      },
    })
  },
  [ReportWidgetType.LIST_PRODUCTS_SERVICE]: {
    config: {
      name: 'products_services',
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
      name: 'tasks_time_trackings',
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
      name: 'credit_report_title',
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
      name: 'loans_new_and_fulfilled_chart',
      icon: IconChartLine,
      layout: chartWidgetlayoutConfig,
    },
    component: chartWidget({
      loading: (ctx) => ctx.isFetching,
      renderData: (ctx) => ctx.rangeReports.map((v) => {
        const date = DateTimeUtils.secondsToTime(v.fromTime);
        return ({
          date: date ? ctx.period === Period.MONTH ? date.getDate() : `${date.getDate()}/${date.getMonth() + 1}` : '-',
          value: v.loans.contracts.new,
          fulfilled: v.loans.contracts.fulfilled,
        })
      }),
      renderSeries: () => [
        { name: 'value', label: t('new_loan_contracts'), color: 'blue.6' },
        { name: 'fulfilled', label: t('loans_fulfilled'), color: 'primary.6' },
      ],
      unit: () => t('loans'),
    }),
  },
  [ReportWidgetType.LOANS_FULFILLED_AMOUNT_CHART]: {
    config: {
      workspaceTypes: [WorkspaceType.CREDIT],
      name: 'loans_fulfilled_amount_chart',
      icon: IconChartLine,
      layout: chartWidgetlayoutConfig,
    },
    component: chartWidget({
      loading: (ctx) => ctx.isFetching,
      renderData: (ctx) => ctx.rangeReports.map((v) => {
        const date = DateTimeUtils.secondsToTime(v.fromTime);
        return ({
          date: date ? ctx.period === Period.MONTH ? date.getDate() : `${date.getDate()}/${date.getMonth() + 1}` : '-',
          value: reportConvertMoneyAmount(v.loans.contracts.fulfilledAmount || 0, ctx.workspace.currency),
        })
      }),
      unit: (ctx) => reportConvertMoneyAmountUnit(ctx.workspace.currency),
      renderSeries: () => [
        { name: 'value', label: t('money_amount'), color: 'primary.6' },
      ]
    }),
  },
  [ReportWidgetType.LOANS_FULFILLED]: {
    config: {
      workspaceTypes: [WorkspaceType.CREDIT],
      name: 'loans_fulfilled',
      icon: IconCreditCardPay,
      layout: numberWidgetlayoutConfig,
    },
    component: numberWidget({
      isLoading: (ctx) => ctx.isFetching,
      renderValue: (ctx) => ctx.rangeReports.reduce((acc, v) => acc + v.loans.contracts.fulfilled, 0),
      renderSparkline: (ctx) => ctx.rangeReports.map((v) => v.loans.contracts.fulfilled),
    })
  },
  [ReportWidgetType.LOANS_FEE]: {
    config: {
      workspaceTypes: [WorkspaceType.CREDIT],
      name: 'report_loans_fee',
      icon: IconBusinessplan,
      layout: numberWidgetlayoutConfig,
    },
    component: numberWidget({
      isLoading: (ctx) => ctx.isFetching,
      type: 'money',
      renderValue: (ctx) => ctx.rangeReports.reduce((acc, v) => acc + (v.receipts.loanFee ?? 0), 0),
    })
  },
  [ReportWidgetType.LOANS_CAPITAL]: {
    config: {
      workspaceTypes: [WorkspaceType.CREDIT],
      name: 'report_loans_capital',
      icon: IconCreativeCommonsSa,
      layout: numberWidgetlayoutConfig,
    },
    component: numberWidget({
      isLoading: (ctx) => ctx.isFetching,
      type: 'money',
      renderValue: (ctx) => ctx.rangeReports.reduce((acc, v) => acc + (v.receipts.loanCapital ?? 0), 0),
    })
  },
  [ReportWidgetType.LOANS_EXPENSE]: {
    config: {
      workspaceTypes: [WorkspaceType.CREDIT],
      name: 'report_loans_expense',
      icon: IconReportMoney,
      layout: numberWidgetlayoutConfig,
    },
    component: numberWidget({
      isLoading: (ctx) => ctx.isFetching,
      type: 'money',
      renderValue: (ctx) => -ctx.rangeReports.reduce((acc, v) => acc + (v.receipts.loanExpense ?? 0), 0),
    })
  },
}