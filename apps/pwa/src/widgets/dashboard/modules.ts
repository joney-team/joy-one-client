"use client";

import { WorkspaceType } from "@/graphql/enums.graphql";
import { getClientLocale } from "@/modules/lang/lang-service";
import {
  reportConvertMoneyAmount,
  reportConvertMoneyAmountUnit,
} from "@/modules/reports/reports-utils";
import { Period } from "@/types";
import { round } from "@/utils/number.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import {
  IconBusinessplan,
  IconCalendar,
  IconCashRegister,
  IconChartLine,
  IconNotes,
  IconStack2,
  IconUsersPlus,
} from "@tabler/icons-react";
import { chartWidget, chartWidgetlayoutConfig } from "../common/chart.widget";
import { numberWidget } from "../common/number.widget";
import { EWidgetModules } from "../widgets-types";
import { DashboardWidgetsContext, DashboardWidgetType } from "./types";

export const dashboardWidgetModules: EWidgetModules<DashboardWidgetType, DashboardWidgetsContext> =
  {
    [DashboardWidgetType.TODAY_REVENUE]: {
      config: {
        name: () => t`Today revenue`,
        icon: IconCashRegister,
        defaultState: {
          style: "dark-content",
        },
      },
      component: numberWidget({
        isLoading: (ctx) => ctx.realtimeReport.isFetching,
        type: "money",
        renderValue: (ctx) => ctx.realtimeReport.data?.data.receipts.revenueToday,
        renderSparkline: (ctx) =>
          ctx.rangeReports.data?.period.map((r) => r.data.receipts.revenue) || [],
        onClick: (ctx) =>
          ctx.router.push(`/reports`, {
            period: Period.DATE,
            date: DateTime.toSeconds(new Date()),
          }),
        boxColor: (ctx) => {
          const totalRevenue = ctx.realtimeReport.data?.data.receipts.revenueToday || 0;
          return totalRevenue >= 0 ? "primary" : "red";
        },
        tooltip: (ctx) =>
          ctx.realtimeReport.data?.updatedAt
            ? t`Last updated at ${DateTime.format(ctx.realtimeReport.data?.updatedAt, {
                locale: getClientLocale(),
              })}`
            : null,
      }),
    },
    [DashboardWidgetType.TODAY_NEW_CUSTOMERS]: {
      config: {
        name: () => t`Today new customers`,
        icon: IconUsersPlus,
      },
      component: numberWidget({
        isLoading: (ctx) => ctx.realtimeReport.isFetching,
        renderValue: (ctx) => ctx.realtimeReport.data?.data.customers.newCustomersToday,
        renderSparkline: (ctx) =>
          ctx.rangeReports.data?.period.map((r) => r.data.customers.total) || [],
        onClick: (ctx) =>
          ctx.router.push(`/customers`, {
            "cus-timeRangeCreatedAt": `${Period.DATE}-${DateTime.toSeconds(new Date())}`,
          }),
      }),
    },
    [DashboardWidgetType.TODAY_BOOKINGS]: {
      config: {
        name: () => t`Today bookings`,
        icon: IconCalendar,
      },
      component: numberWidget({
        isLoading: (ctx) => ctx.realtimeReport.isFetching,
        renderValue: (ctx) => ctx.realtimeReport.data?.data.bookings?.todayCount,
        onClick: (ctx) =>
          ctx.router.push(`/bookings`, {
            "bk-view": "day",
            "bk-date": `${DateTime.toSeconds(new Date())}`,
          }),
      }),
    },
    [DashboardWidgetType.REVENUE_CHART]: {
      config: {
        name: () => t`Revenue chart`,
        icon: IconChartLine,
        layout: chartWidgetlayoutConfig,
      },
      component: chartWidget({
        loading: (ctx) => ctx.rangeReports.isFetching,
        renderData: (ctx) =>
          ctx.rangeReports.data?.period.map((v, i) => {
            const date = DateTime.normalizeDate(v.data.fromTime);
            return {
              date: date ? date.getDate() : "-",
              value: reportConvertMoneyAmount(v.data.receipts.revenue, ctx.currency),
              prevValue: reportConvertMoneyAmount(
                ctx.rangeReports.data?.prevPeriod[i]?.data.receipts.revenue || 0,
                ctx.currency
              ),
            };
          }),
        unit: (ctx) => reportConvertMoneyAmountUnit(ctx.currency),
        renderSeries: () => [
          { name: "prevValue", label: t`Last month`, color: "gray.4", strokeDasharray: "2 2" },
          { name: "value", label: t`This month`, color: "primary.6" },
        ],
      }),
    },
    [DashboardWidgetType.NEW_CUSTOMERS_CHART]: {
      config: {
        name: () => t`New customers chart`,
        icon: IconUsersPlus,
        layout: chartWidgetlayoutConfig,
      },
      component: chartWidget({
        loading: (ctx) => ctx.rangeReports.isFetching,
        renderData: (ctx) =>
          ctx.rangeReports.data?.period.map((v, i) => {
            const date = DateTime.normalizeDate(v.data.fromTime);
            return {
              date: date ? date.getDate() : "-",
              value: v.data.customers.total,
              prevValue: ctx.rangeReports.data?.prevPeriod[i]?.data.customers.total || 0,
            };
          }),
        renderSeries: () => [
          { name: "prevValue", label: t`Last month`, color: "gray.4", strokeDasharray: "2 2" },
          { name: "value", label: t`This month`, color: "primary.6" },
        ],
      }),
    },
    [DashboardWidgetType.BOOKINGS_CHART]: {
      config: {
        name: () => t`Bookings chart`,
        icon: IconChartLine,
        layout: chartWidgetlayoutConfig,
      },
      component: chartWidget({
        loading: (ctx) => ctx.rangeReports.isFetching,
        renderData: (ctx) =>
          ctx.rangeReports.data?.period.map((v, i) => {
            const date = DateTime.normalizeDate(v.data.fromTime);
            return {
              date: date ? date.getDate() : "-",
              value: v.data.bookings.total,
              prevValue: ctx.rangeReports.data?.prevPeriod[i]?.data.bookings.total || 0,
            };
          }),
        renderSeries: () => [
          { name: "prevValue", label: t`Last month`, color: "gray.4", strokeDasharray: "2 2" },
          { name: "value", label: t`This month`, color: "primary.6" },
        ],
      }),
    },

    // ============================ Start Loans ============================
    [DashboardWidgetType.LOANS_ACTIVATED_CONTRACTS]: {
      config: {
        name: () => t`Loans activated contracts`,
        icon: IconNotes,
        workspaceTypes: [WorkspaceType.Credit],
      },
      component: numberWidget({
        isLoading: (ctx) => ctx.realtimeReport.isFetching,
        renderValue: (ctx) => ctx.realtimeReport.data?.data.loans.contracts.activated || 0,
        onClick: (ctx) =>
          ctx.router.push(`/loans`, {
            ltab: "active",
          }),
        tooltip: (ctx) =>
          ctx.realtimeReport.data?.updatedAt
            ? t`Last updated at ${DateTime.format(ctx.realtimeReport.data?.updatedAt, {
                locale: getClientLocale(),
              })}`
            : null,
      }),
    },
    [DashboardWidgetType.LOANS_OVERDUE_CONTRACTS]: {
      config: {
        name: () => t`Loans overdue contracts`,
        icon: IconNotes,
        workspaceTypes: [WorkspaceType.Credit],
        defaultState: { color: "red" },
      },
      component: numberWidget({
        isLoading: (ctx) => ctx.realtimeReport.isFetching,
        renderValue: (ctx) => ctx.realtimeReport.data?.data.loans.contracts.overdue || 0,
        onClick: (ctx) =>
          ctx.router.push(`/loans`, {
            ltab: "overdue",
          }),
        tooltip: (ctx) =>
          ctx.realtimeReport.data?.updatedAt
            ? t`Last updated at ${DateTime.format(ctx.realtimeReport.data?.updatedAt, {
                locale: getClientLocale(),
              })}`
            : null,
      }),
    },
    [DashboardWidgetType.LOANS_PENDING_CONTRACTS]: {
      config: {
        name: () => t`Loans pending contracts`,
        icon: IconNotes,
        workspaceTypes: [WorkspaceType.Credit],
        defaultState: { color: "blue" },
      },
      component: numberWidget({
        isLoading: (ctx) => ctx.realtimeReport.isFetching,
        renderValue: (ctx) => ctx.realtimeReport.data?.data.loans.contracts.pending || 0,
        onClick: (ctx) =>
          ctx.router.push(`/loans`, {
            ltab: "processing",
          }),
        tooltip: (ctx) =>
          ctx.realtimeReport.data?.updatedAt
            ? t`Last updated at ${DateTime.format(ctx.realtimeReport.data?.updatedAt, {
                locale: getClientLocale(),
              })}`
            : null,
      }),
    },
    [DashboardWidgetType.LOANS_DEBT_TOTAL]: {
      config: {
        name: () => t`Loans debt total`,
        icon: IconBusinessplan,
        workspaceTypes: [WorkspaceType.Credit],
      },
      component: numberWidget({
        isLoading: (ctx) => ctx.realtimeReport.isFetching,
        type: "money",
        renderValue: (ctx) => ctx.realtimeReport.data?.data.loans?.debt?.total || 0,
        tooltip: (ctx) =>
          ctx.realtimeReport.data?.updatedAt
            ? t`Last updated at ${DateTime.format(ctx.realtimeReport.data?.updatedAt, {
                locale: getClientLocale(),
              })}`
            : null,
      }),
    },
    [DashboardWidgetType.LOANS_DEBT_NOT_DUE_YET]: {
      config: {
        name: () => t`Loans debt not due yet`,
        icon: IconBusinessplan,
        workspaceTypes: [WorkspaceType.Credit],
        defaultState: { color: "blue" },
      },
      component: numberWidget({
        isLoading: (ctx) => ctx.realtimeReport.isFetching,
        type: "money",
        renderValue: (ctx) => ctx.realtimeReport.data?.data.loans?.debt?.notDueYet || 0,
        tooltip: (ctx) =>
          ctx.realtimeReport.data?.updatedAt
            ? t`Last updated at ${DateTime.format(ctx.realtimeReport.data?.updatedAt, {
                locale: getClientLocale(),
              })}`
            : null,
      }),
    },
    [DashboardWidgetType.LOANS_DEBT_OVERDUE]: {
      config: {
        name: () => t`Loans debt overdue`,
        icon: IconBusinessplan,
        workspaceTypes: [WorkspaceType.Credit],
        defaultState: { color: "red" },
      },
      component: numberWidget({
        isLoading: (ctx) => ctx.realtimeReport.isFetching,
        type: "money",
        renderValue: (ctx) => ctx.realtimeReport.data?.data.loans.debt.overdue || 0,
        onClick: (ctx) =>
          ctx.router.push(`/loans`, {
            ltab: "overdue",
          }),
        tooltip: (ctx) =>
          ctx.realtimeReport.data?.updatedAt
            ? t`Last updated at ${DateTime.format(ctx.realtimeReport.data?.updatedAt, {
                locale: getClientLocale(),
              })}`
            : null,
      }),
    },
    [DashboardWidgetType.LOANS_NEW_CONTRACTS_CHART]: {
      config: {
        name: () => t`Loans new contracts chart`,
        icon: IconChartLine,
        workspaceTypes: [WorkspaceType.Credit],
        layout: chartWidgetlayoutConfig,
      },
      component: chartWidget({
        loading: (ctx) => ctx.rangeReports.isFetching,
        renderData: (ctx) =>
          ctx.rangeReports.data?.period.map((v, i) => {
            const date = DateTime.normalizeDate(v.data.fromTime);
            return {
              date: date ? date.getDate() : "-",
              value: v.data.loans.contracts.new,
              prevValue: ctx.rangeReports.data?.prevPeriod[i]?.data.loans.contracts.new || 0,
            };
          }),
        renderSeries: () => [
          { name: "prevValue", label: t`Last month`, color: "gray.4", strokeDasharray: "2 2" },
          { name: "value", label: t`This month`, color: "primary.6" },
        ],
      }),
    },
    [DashboardWidgetType.LOANS_FULFILLED_AMOUNT_CHART]: {
      config: {
        name: () => t`Loans fulfilled amount chart`,
        icon: IconChartLine,
        workspaceTypes: [WorkspaceType.Credit],
        layout: chartWidgetlayoutConfig,
      },
      component: chartWidget({
        loading: (ctx) => ctx.rangeReports.isFetching,
        renderData: (ctx) =>
          ctx.rangeReports.data?.period.map((v, i) => {
            const date = DateTime.normalizeDate(v.data.fromTime);
            return {
              date: date ? date.getDate() : "-",
              value: reportConvertMoneyAmount(
                v.data.loans.contracts.fulfilledAmount || 0,
                ctx.currency
              ),
              prevValue: reportConvertMoneyAmount(
                ctx.rangeReports.data?.prevPeriod[i]?.data.loans.contracts.fulfilledAmount || 0,
                ctx.currency
              ),
            };
          }),
        unit: (ctx) => reportConvertMoneyAmountUnit(ctx.currency),
        renderSeries: () => [
          { name: "prevValue", label: t`Last month`, color: "gray.4", strokeDasharray: "2 2" },
          { name: "value", label: t`This month`, color: "primary.6" },
        ],
      }),
    },
    // ============================ End Loans ============================

    // ============================ Start Tasks ============================
    [DashboardWidgetType.TASKS_CHART]: {
      config: {
        name: () => t`Tasks chart`,
        icon: IconChartLine,
        layout: chartWidgetlayoutConfig,
      },
      component: chartWidget({
        loading: (ctx) => ctx.rangeReports.isFetching,
        renderData: (ctx) =>
          ctx.rangeReports.data?.period.map((v, i) => {
            const date = DateTime.normalizeDate(v.data.fromTime);
            return {
              date: date ? date.getDate() : "-",
              value: v.data.tasks.total,
              prevValue: ctx.rangeReports.data?.prevPeriod[i]?.data.tasks.total || 0,
            };
          }),
        renderSeries: () => [
          { name: "prevValue", label: t`Last month`, color: "gray.4", strokeDasharray: "2 2" },
          { name: "value", label: t`This month`, color: "primary.6" },
        ],
      }),
    },
    [DashboardWidgetType.TASKS_COMPLETED_RATE_CHART]: {
      config: {
        name: () => t`Tasks completed rate chart`,
        icon: IconChartLine,
        layout: chartWidgetlayoutConfig,
      },
      component: chartWidget({
        loading: (ctx) => ctx.rangeReports.isFetching,
        renderData: (ctx) =>
          ctx.rangeReports.data?.period.map((v, i) => {
            const date = DateTime.normalizeDate(v.data.fromTime);
            return {
              date: date ? date.getDate() : "-",
              value:
                v.data.tasks.total > 0
                  ? round((v.data.tasks.completed * 100) / v.data.tasks.total, 1)
                  : 0,
              prevValue:
                ctx.rangeReports.data?.prevPeriod[i] &&
                ctx.rangeReports.data?.prevPeriod[i].data.tasks.total > 0
                  ? round(
                      (ctx.rangeReports.data?.prevPeriod[i].data.tasks.completed * 100) /
                        ctx.rangeReports.data?.prevPeriod[i].data.tasks.total,
                      1
                    )
                  : 0,
            };
          }),
        renderSeries: () => [
          { name: "prevValue", label: t`Last month`, color: "gray.4", strokeDasharray: "2 2" },
          { name: "value", label: t`This month`, color: "primary.6" },
        ],
      }),
    },
    [DashboardWidgetType.TASKS_TODO]: {
      config: {
        name: () => t`Todo tasks`,
        icon: IconStack2,
      },
      component: numberWidget({
        isLoading: (ctx) => ctx.realtimeReport.isFetching,
        renderValue: (ctx) => ctx.realtimeReport.data?.data.tasks.todo || 0,
        onClick: (ctx) => ctx.router.push(`/tasks`),
      }),
    },
    [DashboardWidgetType.TASKS_PROCESSING]: {
      config: {
        name: () => t`Processing tasks`,
        icon: IconStack2,
        defaultState: { color: "orange" },
      },
      component: numberWidget({
        isLoading: (ctx) => ctx.realtimeReport.isFetching,
        renderValue: (ctx) => ctx.realtimeReport.data?.data.tasks.inProgress || 0,
        onClick: (ctx) => ctx.router.push(`/tasks`),
      }),
    },
  };
