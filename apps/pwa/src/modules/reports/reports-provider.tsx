"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useFetch } from "@/utils/use-fetch.util";
import { FC, PropsWithChildren } from "react";
import { useEventsListener } from "../events/event-service";
import { useWorkspace } from "../workspaces/workspace-context";
import { Context } from "./reports-context";
import { getRealtimeReport } from "./reports-services";

export const ReportsProvider: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();

  const realtimeReport = useFetch(
    {
      skip: !workspace.member,
      id: `realtime-report-${workspace.member?.userId}-${workspace.member?.workspaceId}`,
      fetch: () => getRealtimeReport(),
    },
    [workspace.member?.workspaceId]
  );

  useEventsListener(
    [EventType.ReportRealtimeSynced],
    (e) => {
      if (e.data && e.data.userId === workspace.member.userId) {
        realtimeReport.setData(e.data);
      }
    },
    [workspace.member?.workspaceId, workspace.member?.userId]
  );

  return <Context.Provider value={{ realtimeReport }}>{props.children}</Context.Provider>;
};
