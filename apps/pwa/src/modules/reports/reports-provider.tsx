"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useQuery } from "@apollo/client/react";
import { FC, PropsWithChildren } from "react";
import { useEventsListener } from "../events/event-service";
import { useWorkspace } from "../workspaces/workspace-context";
import { Context } from "./reports-context";
import GetMetricsReportDocument from "./graphql/getMetricsReport.graphql";

export const ReportsProvider: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();

  const {
    data,
    refetch,
    loading: isMetricsLoading,
  } = useQuery(GetMetricsReportDocument, {
    fetchPolicy: "cache-and-network",
    skip: !workspace.member?.workspaceId,
  });

  useEventsListener(
    [EventType.ReportMetricsSynced],
    (e) => {
      if (e.data && e.data.userId === workspace.member.userId) {
        refetch();
      }
    },
    [workspace.member?.workspaceId, workspace.member?.userId],
  );

  return (
    <Context.Provider value={{ metrics: data?.metricsReport, isMetricsLoading, refetch }}>
      {props.children}
    </Context.Provider>
  );
};
