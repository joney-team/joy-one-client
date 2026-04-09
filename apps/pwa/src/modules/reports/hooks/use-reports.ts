import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useQuery } from "@apollo/client/react";
import GetMetricsReportDocument from "../graphql/getMetricsReport.graphql";

export const useReports = () => {
  const workspace = useWorkspace();

  const { data, refetch, loading, error } = useQuery(GetMetricsReportDocument, {
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

  return {
    metrics: data?.metricsReport,
    isMetricsLoading: loading && !data,
    error,
    refetch,
  };
};

export type UseReports = ReturnType<typeof useReports>;
