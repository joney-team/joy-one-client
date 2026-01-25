"use client";

import { EventType } from "@/graphql/enums.graphql";
import { InternalEvent, onInternalEvent } from "@/hooks/use-internal-event";
import { useEventsListener } from "@/modules/events/event-service";
import { wait } from "@/utils/common.utils";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import QUERY_TASKS, { TasksQueryVariables } from "../graphql/queryTasks.graphql";
import QUERY_TASKS_COUNT, {
  type TasksCountQuery,
  type TasksCountQueryVariables,
} from "../graphql/queryTasksCount.graphql";

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
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (isSkipLoadCount) return;
    fetchTasksCount({ variables });
  }, [variables, isSkipLoadCount]);

  const [fetchTasks, { data, loading, fetchMore, error }] = useLazyQuery(QUERY_TASKS, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const tasks = useMemo(() => {
    return Array.from(data?.tasks.results ?? []).sort((a, b) => a.order - b.order);
  }, [data]);

  const getTasks = useCallback(async () => {
    try {
      const result = await fetchTasks({ variables });
      if (result.data?.tasks.total !== dataCount?.tasksCount) {
        client.cache.updateQuery(
          {
            query: QUERY_TASKS_COUNT,
            variables,
          },
          (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              tasksCount: result.data?.tasks.total ?? 0,
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
        offset: data.tasks.results.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || !prev) return prev;

        // Sync tasks count
        if (dataCount && fetchMoreResult.tasks.total !== dataCount.tasksCount) {
          client.cache.updateQuery(
            {
              query: QUERY_TASKS_COUNT,
              variables,
            },
            (dataCountPrev) => {
              if (!dataCountPrev) return dataCountPrev;
              return {
                ...dataCountPrev,
                tasksCount: fetchMoreResult.tasks.total,
              };
            }
          );
        }

        return {
          ...fetchMoreResult,
          tasks: {
            ...fetchMoreResult.tasks,
            results: [
              ...(prev.tasks.results ?? []),
              ...(fetchMoreResult.tasks.results ?? []).filter(
                (task) => !(prev.tasks.results ?? []).some((t) => t._id === task._id)
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
    return !!data && data.tasks.results.length < data.tasks.total && !loading;
  }, [data, loading]);

  useEffect(() => {
    if (!data) return;

    const onRefetchTasks = () => {
      fetchMore({
        variables: {
          ...variables,
          offset: 0,
          limit: variables.all ? undefined : data.tasks.results.length + 5,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    };

    return onInternalEvent(InternalEvent.REFETCH_TASKS, onRefetchTasks);
  }, [data]);

  useEventsListener(
    [EventType.TaskArchived],
    (e) => {
      const task = data?.tasks.results.find((t) => t._id === e.ref);
      if (!task) return;

      client.cache.updateQuery(
        {
          query: QUERY_TASKS,
          variables,
        },
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              total: prev.tasks.total - 1,
              results: [...prev.tasks.results.filter((t) => t._id !== task._id)],
            },
          };
        }
      );

      client.cache.updateQuery<TasksCountQuery, TasksCountQueryVariables>(
        {
          query: QUERY_TASKS_COUNT,
          variables,
        },
        (prev) => {
          if (!prev) return prev;
          return { ...prev, tasksCount: prev.tasksCount - 1 };
        }
      );
    },
    [data, dataCount, client]
  );

  return {
    variables,
    getTasks,
    tasks,
    count: data?.tasks?.total ?? dataCount?.tasksCount,
    loading: loading && !data,
    loadMore: handleLoadMore,
    isCanLoadMore,
    isLoadingMore,
    isHasData: !!data,
    error,
  };
};
