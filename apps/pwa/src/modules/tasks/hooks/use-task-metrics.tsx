"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { useQuery } from "@apollo/client/react";
import GetTaskMetricsDocument, {
  GetTaskMetricsQueryVariables,
} from "../graphql/getTaskMetrics.graphql";

export const useTaskMetrics = (variables: GetTaskMetricsQueryVariables) => {
  const { data, loading, error, refetch } = useQuery(GetTaskMetricsDocument, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  useEventsListener(
    EventType.TaskMetricSynced,
    (e) => {
      if (
        e.data?.contextType === variables.contextType &&
        (e.data?.contextId ?? null) === (variables.contextId ?? null)
      ) {
        refetch();
      }
    },
    [variables.contextType, variables.contextId, refetch],
  );

  return {
    metrics: data?.metrics,
    loading,
    error,
  };
};
