"use client";

import { InternalEvent, onInternalEvent } from "@/hooks/use-internal-event";
import { wait } from "@/utils/common.utils";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import QUERY_TASKS, {
  type TasksQuery,
  type TasksQueryVariables,
} from "../queries/queryTasks.graphql";
import QUERY_TASKS_COUNT, {
  type TasksCountQuery,
  type TasksCountQueryVariables,
} from "../queries/queryTasksCount.graphql";

export const useTasksQuery = ({
  variables,
  isSkipLoadCount = false,
}: {
  variables: TasksQueryVariables;
  isSkipLoadCount?: boolean;
}) => {
  const client = useApolloClient();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [fetchTasksCount, { data: dataCount }] = useLazyQuery<
    TasksCountQuery,
    TasksCountQueryVariables
  >(QUERY_TASKS_COUNT, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (isSkipLoadCount) return;
    fetchTasksCount({ variables });
  }, [fetchTasksCount, variables, isSkipLoadCount]);

  const [fetchTasks, { data, loading, fetchMore, error }] = useLazyQuery<
    TasksQuery,
    TasksQueryVariables
  >(QUERY_TASKS, {
    fetchPolicy: "network-only",
  });

  const tasks = useMemo(() => {
    return Array.from(data?.tasks.data ?? []).sort((a, b) => a.order - b.order);
  }, [data]);

  const getTasks = useCallback(async () => {
    try {
      const result = await fetchTasks({ variables });

      if (result.data?.tasks.count !== dataCount?.tasksCount) {
        client.cache.updateQuery<TasksCountQuery, TasksCountQueryVariables>(
          {
            query: QUERY_TASKS_COUNT,
            variables,
          },
          (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              tasksCount: result.data?.tasks.count ?? 0,
            };
          }
        );
      }
    } catch {}
  }, [fetchTasks, variables]);

  const handleLoadMore = useCallback(async () => {
    if (!data) return;

    setIsLoadingMore(true);
    await fetchMore({
      variables: {
        ...variables,
        offset: data.tasks.data.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || !prev) return prev;

        // Sync tasks count
        if (dataCount && fetchMoreResult.tasks.count !== dataCount.tasksCount) {
          client.cache.updateQuery<TasksCountQuery, TasksCountQueryVariables>(
            {
              query: QUERY_TASKS_COUNT,
              variables,
            },
            (dataCountPrev) => {
              if (!dataCountPrev) return dataCountPrev;
              return {
                ...dataCountPrev,
                tasksCount: fetchMoreResult.tasks.count,
              };
            }
          );
        }

        return {
          ...prev,
          tasks: {
            ...prev.tasks,
            count: fetchMoreResult.tasks.count,
            data: [
              ...(prev.tasks.data ?? []),
              ...(fetchMoreResult.tasks.data ?? []).filter(
                (task) => !(prev.tasks.data ?? []).some((t) => t._id === task._id)
              ),
            ],
          },
        };
      },
    })
      .catch(console.error)
      .finally(async () => {
        await wait(500);
        setIsLoadingMore(false);
      });
  }, [variables, data, fetchMore, dataCount, client]);

  const isCanLoadMore = useMemo(() => {
    return !!data && data.tasks.data.length < data.tasks.count && !loading;
  }, [data, loading]);

  useEffect(() => {
    if (!data) return;

    const onRefetchTasks = () => {
      fetchMore({
        variables: {
          ...variables,
          offset: 0,
          limit: variables.all ? undefined : data.tasks.data.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    };

    return onInternalEvent(InternalEvent.REFETCH_TASKS, onRefetchTasks);
  }, [data]);

  return {
    variables,
    getTasks,
    tasks,
    count: data?.tasks?.count ?? dataCount?.tasksCount,
    loading,
    loadMore: handleLoadMore,
    isCanLoadMore,
    isLoadingMore,
    error,
  };
};
