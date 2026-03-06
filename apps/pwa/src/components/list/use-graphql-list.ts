"use client";

import { EventDataActionType, EventType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { onReconnected, useEventsListener } from "@/modules/events/event-service";
import { EventEntity } from "@/modules/events/event-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { TypedDocumentNode } from "@apollo/client";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";
import { type BaseData } from "@joy-one-client/utils/base-data";
import { removeParams, setParams } from "@joy-one-client/utils/location-query";
import { useLingui } from "@lingui/react/macro";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isPlural } from "../../utils/string.utils";

export interface UseGraphqlListArgs<T = any> {
  id: string;
  isSkip?: boolean;
  params?: Record<string, any>;
  initialData?: T[];
  limit?: number;
  autoFetch?: boolean;
  query: TypedDocumentNode;
  events?:
    | EventType[]
    | {
        types: EventType[];
        condition?: (data: EventEntity, currentData: T[]) => boolean;
      };
  isIgnoreEventActionType?: boolean;
  normalizeParams?: (params?: Record<string, any>) => Record<string, any>;
}

export type UseGraphqlListData<T = BaseData> = {
  list: {
    results: T[];
    total: number;
  };
};

export const useGraphqlList = <T extends BaseData>({
  limit = 30,
  isSkip = false,
  autoFetch = true,
  normalizeParams,
  ...args
}: UseGraphqlListArgs<T>) => {
  const { t } = useLingui();
  const searchs = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const workspace = useWorkspace();
  const client = useApolloClient();

  const isReadyToFetch = !isSkip;

  const [newDataCount, setNewDataCount] = useState(0);

  const listKey = useMemo(() => {
    return args.id ? args.id.replace(/-/g, "") : undefined;
  }, [args.id]);

  const params = useMemo(() => {
    let combine: Record<string, any> = { ...args.params };

    if (listKey) {
      searchs.forEach((value, key) => {
        const prefix = key.split("-")[0];
        if (prefix === listKey) {
          const _key = key.split("-").slice(1).join("-");
          if (isPlural(key)) combine[_key] = value.split(",");
          else combine[_key] = value;
        }
      });
    } else {
      searchs.forEach((value, key) => {
        const prefix = key.split("-");
        if (prefix.length === 1) combine[key] = value;
      });
    }

    return combine;
  }, [searchs, listKey, args.params]);

  const variables = useMemo(() => {
    return {
      limit,
      query: normalizeParams ? normalizeParams(params) : params,
    };
  }, [limit, params]);

  const [fetch, { data: queryData, loading, error: queryError, refetch, fetchMore }] =
    useLazyQuery<UseGraphqlListData>(args.query, {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    });

  useEffect(() => {
    if (!isReadyToFetch) return;
    fetch({ variables });
  }, [isReadyToFetch, variables, workspace.member?.workspaceId]);

  const listData = useMemo(() => {
    const list =
      queryData &&
      typeof queryData === "object" &&
      "list" in queryData &&
      typeof queryData.list === "object"
        ? queryData.list
        : {};

    const results =
      list && "results" in list && typeof list === "object" && Array.isArray(list.results)
        ? list.results
        : [];

    return results;
  }, [queryData]);

  const listTotal = useMemo(() => {
    const list =
      queryData &&
      typeof queryData === "object" &&
      "list" in queryData &&
      typeof queryData.list === "object"
        ? queryData.list
        : {};

    const total =
      list && "total" in list && typeof list === "object" && typeof list.total === "number"
        ? list.total
        : 0;
    return total;
  }, [queryData]);

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const isAbleToLoadMore = useMemo(() => {
    return !loading && !isFetchingMore && listData.length < listTotal;
  }, [loading, isFetchingMore, listData, listTotal]);

  const onFetchMore = useCallback(async () => {
    if (!queryData || !isAbleToLoadMore) return;
    setIsFetchingMore(true);
    await fetchMore({
      variables: { limit, query: params, offset: listData.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || !prev) return prev;
        return {
          ...prev,
          list: { ...prev.list, results: [...prev.list.results, ...fetchMoreResult.list.results] },
        };
      },
    })
      .catch(() => false)
      .finally(() => setIsFetchingMore(false));
  }, [listData, isAbleToLoadMore, fetchMore, limit, params]);

  const onRefetch = useCallback(async () => {
    await fetchMore({
      variables: {
        ...variables,
        limit: listData.length,
        offset: 0,
      },
      updateQuery: (_, { fetchMoreResult }) => {
        return fetchMoreResult;
      },
    }).catch(onError);
  }, [listData, limit, params]);

  const isHasData = useMemo(() => {
    return listTotal > 0 && !loading;
  }, [loading, listTotal]);

  const listError = useMemo(() => {
    if (!queryError) return undefined;
    return t`Load data failed.`;
  }, [queryError]);

  const isEmpty = useMemo(() => {
    return !loading && listTotal === 0 && !queryError;
  }, [loading, listTotal]);

  const isHasError = useMemo(() => {
    return !!queryError;
  }, [queryError]);

  // Event listener
  const events = Array.isArray(args.events) ? args.events : args.events?.types || [];
  const onEvent = async (e: EventEntity) => {
    try {
      if (args.isIgnoreEventActionType || e.userId === workspace.member.userId) {
        return refetch();
      }

      if (e.actionType === EventDataActionType.Archived) {
        return;
      }

      if (e.actionType === EventDataActionType.Create) {
        const response = await client.query<UseGraphqlListData>({
          query: args.query,
          variables,
        });

        if (response.data && response.data.list.total > listTotal) {
          setNewDataCount(response.data.list.total - listTotal);
        }

        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEventsListener(
    events,
    (e) => {
      if (isReadyToFetch) {
        const condition =
          args.events && "condition" in args.events ? args.events.condition : undefined;
        if (condition && !condition(e, listData)) return;
        onEvent(e);
      }
    },
    [args.events, listKey, params, isReadyToFetch, listData, listTotal]
  );

  // Auto fetch when server reconnected
  onReconnected(() => {
    if (autoFetch && isReadyToFetch && (queryData || queryError)) {
      refetch();
    }
  }, [JSON.stringify(params), autoFetch, listKey, isReadyToFetch]);

  return {
    isFetching: loading,
    isInitialized: !!queryData,
    data: listData,
    count: listTotal,
    error: listError,
    params,
    isHasError,
    isHasData,
    isEmpty,
    isAbleToLoadMore,
    loadMore: async () => {
      await onFetchMore();
    },
    limit,
    setParams: (params: Record<string, unknown>) => {
      router.replace(
        setParams(
          Object.keys(params).reduce(
            (acc, key) => ({ ...acc, [`${listKey}-${key}`]: params[key] }),
            {}
          )
        ),
        { scroll: false }
      );
    },
    removeParams: (keys: string[]) => {
      router.replace(removeParams(...keys.map((key) => `${listKey}-${key}`)), { scroll: false });
    },
    removeAllParams: () => {
      const params = new URLSearchParams(searchs.toString());
      if (listKey) {
        searchs.forEach((_, key) => {
          if (key.split("-")[0] === listKey) params.delete(key);
        });
      } else {
        searchs.forEach((_, key) => {
          if (key.split("-").length === 1) params.delete(key);
        });
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    newDataCount,
    refetch: onRefetch,
  };
};

export type UseGraphqlList<T extends BaseData> = ReturnType<typeof useGraphqlList<T>>;
