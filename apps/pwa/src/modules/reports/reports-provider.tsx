import { useFetch } from "@/utils/use-fetch.util";
import { FC, PropsWithChildren } from "react";
import { onReconnected, useEventsListener } from "../events/event-service";
import { EventType } from "../events/event-types";
import { useWorkspace } from "../workspaces/workspace-context";
import { Context } from "./reports-context";
import { getRealtimeReport } from "./reports-services";

export const ReportsProvider: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();

  const realtimeReport = useFetch(
    {
      skip: !workspace.userMember,
      id: `realtime-report-${workspace.userMember?.userId}-${workspace.userMember?.workspaceId}`,
      fetch: () => getRealtimeReport(),
    },
    [workspace.userMember?.workspaceId]
  );

  useEventsListener(
    [EventType.REPORT_REALTIME_SYNCED],
    (e) => {
      if (
        e.data &&
        e.data.userId === workspace.userMember.userId &&
        e.workspaceId === workspace.userMember.workspaceId
      ) {
        realtimeReport.setData(e.data);
      }
    },
    [workspace.userMember?.workspaceId, workspace.userMember?.userId]
  );

  onReconnected(() => realtimeReport.fetch(), [workspace.userMember?.workspaceId]);

  return <Context.Provider value={{ realtimeReport }}>{props.children}</Context.Provider>;
};
