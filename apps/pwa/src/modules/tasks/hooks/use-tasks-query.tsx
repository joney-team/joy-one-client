"use client";

import { EventType } from "@/graphql/enums.graphql";
import { InternalEvent, onInternalEvent } from "@/hooks/use-internal-event";
import { useEventsListener } from "@/modules/events/event-service";
import { wait } from "@/utils/common.utils";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import GetTasksDocument, { GetTasksQueryVariables } from "../graphql/getTasks.graphql";
import GetTasksCountDocument from "../graphql/getTasksCount.graphql";

export const useTasksQuery = ({
  variables,
  isSkipLoadCount = false,
}: {
  variables: GetTasksQueryVariables;
  isSkipLoadCount?: boolean;
}) => {
  const client = useApolloClient();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [fetchTasksCount, { data: dataCount }] = useLazyQuery(GetTasksCountDocument, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (isSkipLoadCount) return;
    fetchTasksCount({ variables });
  }, [variables, isSkipLoadCount]);

  const [fetchTasks, { data, loading, fetchMore, error }] = useLazyQuery(GetTasksDocument, {
    fetchPolicy: "cache-and-network",
  });

  const tasks = useMemo(() => {
    return Array.from(data?.list.results ?? []).sort((a, b) => a.order - b.order);
  }, [data]);

  const getTasks = useCallback(async () => {
    try {
      const result = await fetchTasks({ variables });
      if (result.data?.list.total !== dataCount?.tasksCount) {
        client.cache.updateQuery(
          {
            query: GetTasksCountDocument,
            variables,
          },
          (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              tasksCount: result.data?.list.total ?? 0,
            };
          },
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
        offset: data.list.results.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || !prev) return prev;

        // Sync tasks count
        if (dataCount && fetchMoreResult.list.total !== dataCount.tasksCount) {
          client.cache.updateQuery(
            {
              query: GetTasksCountDocument,
              variables,
            },
            (dataCountPrev) => {
              if (!dataCountPrev) return dataCountPrev;
              return {
                ...dataCountPrev,
                tasksCount: fetchMoreResult.list.total,
              };
            },
          );
        }

        return {
          ...fetchMoreResult,
          list: {
            ...fetchMoreResult.list,
            results: [
              ...(prev.list.results ?? []),
              ...(fetchMoreResult.list.results ?? []).filter(
                (task) => !(prev.list.results ?? []).some((t) => t._id === task._id),
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
    return !!data && data.list.results.length < data.list.total && !loading;
  }, [data, loading]);

  useEffect(() => {
    if (!data) return;

    const onRefetchTasks = () => {
      fetchMore({
        variables: {
          ...variables,
          offset: 0,
          limit: variables.all ? undefined : data.list.results.length + 5,
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
      const task = data?.list.results.find((t) => t._id === e.ref);
      if (!task) return;

      client.cache.updateQuery(
        {
          query: GetTasksDocument,
          variables,
        },
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            list: {
              ...prev.list,
              total: prev.list.total - 1,
              results: [...prev.list.results.filter((t) => t._id !== task._id)],
            },
          };
        },
      );

      client.cache.updateQuery(
        {
          query: GetTasksCountDocument,
          variables,
        },
        (prev) => {
          if (!prev) return prev;
          return { ...prev, tasksCount: prev.tasksCount - 1 };
        },
      );
    },
    [data, dataCount, client],
  );

  return {
    variables,
    getTasks,
    tasks,
    count: data?.list?.total ?? dataCount?.tasksCount,
    loading: loading && !data,
    loadMore: handleLoadMore,
    isCanLoadMore,
    isLoadingMore,
    isHasData: !!data,
    error,
  };
};
