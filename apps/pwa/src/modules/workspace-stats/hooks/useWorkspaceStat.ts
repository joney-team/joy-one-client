import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { useQuery } from "@apollo/client/react";
import GetWorkspaceStatDocument from "../graphql/getWorkspaceStat.graphql";

export const useWorkspaceStat = () => {
  const { data, loading, refetch } = useQuery(GetWorkspaceStatDocument);

  useEventsListener([EventType.WorkspaceStatsUpdated], () => {
    refetch();
  });

  return {
    workspaceStat: data?.workspaceStat,
    loading: loading && !data?.workspaceStat,
  };
};
