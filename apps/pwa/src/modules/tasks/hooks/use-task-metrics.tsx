"use client";

import { useQuery } from "@apollo/client/react";
import QUERY_TASK_METRICS, {
  type TaskMetricsQuery,
  type TaskMetricsQueryVariables,
} from "../graphql/queryTaskMetrics.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/graphql/enums.graphql";

export const useTaskMetrics = (variables: TaskMetricsQueryVariables) => {
  const { data, loading, error, refetch } = useQuery<TaskMetricsQuery, TaskMetricsQueryVariables>(
    QUERY_TASK_METRICS,
    {
      variables,
      fetchPolicy: "cache-and-network",
    }
  );

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
    [variables.contextType, variables.contextId, refetch]
  );

  return {
    metric: data?.taskMetrics,
    loading,
    error,
  };
};
