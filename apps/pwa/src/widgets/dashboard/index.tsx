"use client";

import { EventType, Period } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { useAuth } from "@/modules/auth/auth-context";
import { useEventsListener } from "@/modules/events/event-service";
import { TimeSeriesReportFragment } from "@/modules/reports/graphql/fragmentTimeSeriesReport.graphql";
import GetTimeSeriesReportsDocument from "@/modules/reports/graphql/getTimeSeriesReports.graphql";
import { useReports } from "@/modules/reports/hooks/use-reports";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { getDefaultWorkspaceView } from "@/modules/workspace-settings/workspace-settings-view";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useFetch } from "@/utils/use-fetch.util";
import { useApolloClient } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Stack } from "@mantine/core";
import { FC, useMemo } from "react";
import { Widgets } from "../widgets";
import { dashboardWidgetModules } from "./modules";
import { DashboardWidgetsContext, TimeSeriesReports } from "./types";

export const DashboardWidgets: FC = () => {
  const workspace = useWorkspace();
  const { workspaceView, currency, updateWorkspaceView } = useWorkspaceSetting();
  const router = useRouter();
  const auth = useAuth();
  const reports = useReports();
  const client = useApolloClient();

  const rangeReports = useFetch<TimeSeriesReports>(
    {
      id: `range-reports-${auth.user?._id}`,
      fetch: async () => {
        const now = new Date();
        const rangeMonth = DateTime.getRange(now, "month");

        const startOfMonth = {
          current: rangeMonth.start,
          prev: DateTime.subtract(rangeMonth.start, "month", 1),
        };

        const totalDateBwtStartOfMonthToNow = DateTime.diff(rangeMonth.start, now, "day");

        const ranges = {
          current: {
            start: startOfMonth.current,
            end: DateTime.add(startOfMonth.current, "day", totalDateBwtStartOfMonthToNow),
          },
          prev: {
            start: startOfMonth.prev,
            end: DateTime.add(startOfMonth.prev, "day", totalDateBwtStartOfMonthToNow),
          },
        };

        const rangeResults = await Promise.all([
          client.query({
            query: GetTimeSeriesReportsDocument,
            variables: {
              input: {
                period: Period.Date,
                fromTime: DateTime.toSeconds(ranges.current.start),
                toTime: DateTime.toSeconds(ranges.current.end),
              },
            },
          }),
          client.query({
            query: GetTimeSeriesReportsDocument,
            variables: {
              input: {
                period: Period.Date,
                fromTime: DateTime.toSeconds(ranges.prev.start),
                toTime: DateTime.toSeconds(ranges.prev.end),
              },
            },
          }),
        ]);

        const output: TimeSeriesReports = {
          lastSyncedAt:
            rangeResults[0].data?.list.results[0]?.updatedAt ?? DateTime.getNowInSeconds(),
          prevPeriod: rangeResults[1].data?.list.results ?? [],
          period: rangeResults[0].data?.list.results ?? [],
        };

        return output;
      },
    },
    [workspace.member.workspaceId],
  );

  useEventsListener(
    [EventType.ReportTimeSeriesSynced],
    (e) => {
      const _report = e.data as TimeSeriesReportFragment;

      // TODO: Get from server instead of updating by hand
      if (rangeReports.data) {
        rangeReports.setData({
          ...rangeReports.data,
          period: rangeReports.data.period.map((v) => (v._id === _report._id ? { ..._report } : v)),
          prevPeriod: rangeReports.data.prevPeriod.map((v) =>
            v._id === _report._id ? { ..._report } : v,
          ),
        });
      }
    },
    [rangeReports.data],
  );

  const context: DashboardWidgetsContext = {
    router,
    metrics: reports.metrics,
    timeSeries: rangeReports,
    isMetricsLoading: reports.isMetricsLoading,
    workspace,
    currency,
  };

  const defaultWidgets = useMemo(
    () => getDefaultWorkspaceView(workspace.type).dashboardWidgets,
    [workspace.type],
  );

  return (
    <Stack>
      <Widgets
        id="dashboard"
        readonly={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        context={context}
        widgets={workspaceView.dashboardWidgets}
        defaultWidgets={defaultWidgets}
        modules={dashboardWidgetModules}
        onChange={(widgets) => {
          updateWorkspaceView({
            dashboardWidgets:
              widgets?.map((v) => ({
                __typename: "DisplayWidget",
                id: v.id,
                type: v.type,
                state: v.state,
              })) ?? null,
          });
        }}
      />
    </Stack>
  );
};
