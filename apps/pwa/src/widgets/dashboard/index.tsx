"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { useAuth } from "@/modules/auth/auth-context";
import { useEventsListener } from "@/modules/events/event-service";
import { useReports } from "@/modules/reports/reports-context";
import { ReportEntity } from "@/modules/reports/reports-entity";
import { exportPeriodReport } from "@/modules/reports/reports-services";
import { RangeReport } from "@/modules/reports/reports-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/useWorkspaceSetting";
import { getDefaultWorkspaceView } from "@/modules/workspace-settings/workspace-settings-view";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Period } from "@/types";
import { useFetch } from "@/utils/use-fetch.util";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Stack } from "@mantine/core";
import { FC } from "react";
import { Widgets } from "../widgets";
import { dashboardWidgetModules } from "./modules";
import { DashboardWidgetsContext, RangeReports } from "./types";

export const DashboardWidgets: FC = () => {
  const workspace = useWorkspace();
  const { workspaceView, currency, updateWorkspaceView } = useWorkspaceSetting();
  const router = useRouter();
  const auth = useAuth();
  const reports = useReports();

  const rangeReports = useFetch<RangeReports>(
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
          exportPeriodReport({
            period: Period.DATE,
            fromTime: DateTime.toSeconds(ranges.current.start),
            toTime: DateTime.toSeconds(ranges.current.end),
          }),
          exportPeriodReport({
            period: Period.DATE,
            fromTime: DateTime.toSeconds(ranges.prev.start),
            toTime: DateTime.toSeconds(ranges.prev.end),
          }),
        ]);

        const output: RangeReports = {
          lastSyncedAt: rangeResults[0].data[0]?.lastInteractionAt,
          prevPeriod: rangeResults[1].data,
          period: rangeResults[0].data,
        };

        return output;
      },
    },
    [workspace.member.workspaceId]
  );

  useEventsListener(
    [EventType.ReportRangeSynced],
    (e) => {
      const _report = e.data as ReportEntity<RangeReport>;

      if (rangeReports.data) {
        rangeReports.setData({
          ...rangeReports.data,
          period: rangeReports.data.period.map((v) => (v._id === _report._id ? { ..._report } : v)),
          prevPeriod: rangeReports.data.prevPeriod.map((v) =>
            v._id === _report._id ? { ..._report } : v
          ),
        });
      }
    },
    [rangeReports.data]
  );

  const context: DashboardWidgetsContext = {
    router,
    realtimeReport: reports.realtimeReport,
    rangeReports,
    workspace,
    currency,
  };

  return (
    <Stack>
      <Widgets
        id="dashboard"
        readonly={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        context={context}
        widgets={workspaceView.dashboardWidgets}
        defaultWidgets={getDefaultWorkspaceView(workspace.type).dashboardWidgets}
        modules={dashboardWidgetModules}
        onChange={(widgets) =>
          updateWorkspaceView({
            dashboardWidgets: (widgets ?? []).map((v) => ({
              __typename: "DisplayWidget",
              id: v.id,
              type: v.type,
              state: v.state,
            })),
          })
        }
      />
    </Stack>
  );
};
