"use client";

import { useRouter } from "@/hooks/use-router";
import { useAuth } from "@/modules/auth/auth-context";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { useReports } from "@/modules/reports/reports-context";
import { ReportEntity } from "@/modules/reports/reports-entity";
import { exportPeriodReport } from "@/modules/reports/reports-services";
import { RangeReport } from "@/modules/reports/reports-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getDefaultWorkspaceView } from "@/modules/workspaces/workspace-view";
import { Period } from "@/types";
import { useFetch } from "@/utils/use-fetch.util";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Stack } from "@mantine/core";
import dayjs from "dayjs";
import { FC } from "react";
import { Widgets } from "..";
import { dashboardWidgetModules } from "./modules";
import { DashboardWidgetsContext, RangeReports } from "./types";

export const DashboardWidgets: FC = () => {
  const workspace = useWorkspace();
  const router = useRouter();
  const auth = useAuth();
  const reports = useReports();

  const rangeReports = useFetch<RangeReports>(
    {
      id: `range-reports-${auth.user?._id}`,
      fetch: async () => {
        const now = new Date();
        const startOfMonth = {
          current: dayjs(now).startOf("month").toDate(),
          prev: dayjs(now).subtract(1, "month").startOf("month").toDate(),
        };

        const totalDateBwtStartOfMonthToNow = dayjs().diff(startOfMonth.current, "day");

        const ranges = {
          current: {
            start: startOfMonth.current,
            end: dayjs(
              dayjs(startOfMonth.current).add(totalDateBwtStartOfMonthToNow, "day").toDate()
            )
              .endOf("day")
              .toDate(),
          },
          prev: {
            start: startOfMonth.prev,
            end: dayjs(dayjs(startOfMonth.prev).add(totalDateBwtStartOfMonthToNow, "day").toDate())
              .endOf("day")
              .toDate(),
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
    [workspace.userMember.workspaceId]
  );

  useEventsListener(
    [EventType.REPORT_RANGE_SYNCED],
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
  };

  return (
    <Stack>
      <Widgets
        id="dashboard"
        readonly={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        context={context}
        widgets={workspace.view.dashboardWidgets}
        defaultWidgets={getDefaultWorkspaceView(workspace.type).dashboardWidgets}
        modules={dashboardWidgetModules}
        onChange={(widgets) =>
          workspace.setView({
            ...workspace.view,
            dashboardWidgets: widgets,
          })
        }
      />
    </Stack>
  );
};
