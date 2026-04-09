"use client";

import { EventDataActionType, EventType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { onReconnected, useEventsListener } from "@/modules/events/event-service";
import { EventFragment } from "@/modules/events/graphql/fragmentEvent.graphql";
import { onError } from "@/utils/exceptions.utils";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";
import { type BaseData } from "@joy-one-client/utils/base-data";
import { removeParams, setParams } from "@joy-one-client/utils/location-query";
import { useLingui } from "@lingui/react/macro";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isPlural } from "../../utils/string.utils";

export interface UseGraphqlListArgs<T extends BaseData = BaseData> {
  id?: string;
  isSkip?: boolean;
  params?: Record<string, any>;
  initialData?: T[];
  limit?: number;
  autoFetch?: boolean;
  query: TypedDocumentNode;
  events?: EventType[];
  isIgnoreEventDataActionType?: boolean;
  normalizeParams?: (params?: Record<string, any>) => Record<string, any>;
  debug?: boolean;
  fetchPolicy?: "cache-first" | "cache-and-network" | "network-only" | "no-cache";
}

export type UseGraphqlListData<T extends BaseData = BaseData> = {
  list: {
    results: T[];
    total: number;
  };
};

export const emptyDocument = gql`
  query {
    dummy: __typename
  }
`;

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
  const client = useApolloClient();

  const isReadyToFetch = !isSkip && args.query !== emptyDocument;

  const [totalChange, setTotalChange] = useState(0);

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

  const [fetch, { data: queryData, loading, error: queryError, refetch, fetchMore }] = useLazyQuery<
    UseGraphqlListData<T>
  >(args.query, {
    fetchPolicy: args.fetchPolicy || "cache-and-network",
  });

  useEffect(() => {
    if (!isReadyToFetch) return;
    fetch({ variables });
  }, [isReadyToFetch, variables]);

  const listData = useMemo<T[]>(() => {
    const list = queryData?.list || {};
    const results = list && "results" in list ? list.results : [];
    return Array.from(results as T[]);
  }, [queryData]);

  const listTotal = useMemo(() => {
    const list = queryData?.list || {};
    const total = list && "total" in list ? list.total : 0;
    return Number(total);
  }, [queryData]);

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const isAbleToLoadMore = useMemo(() => {
    return !loading && !isFetchingMore && listData.length < listTotal;
  }, [loading, isFetchingMore, listData, listTotal]);

  const onFetchMore = useCallback(async () => {
    if (!queryData || !isAbleToLoadMore) return;
    setIsFetchingMore(true);
    await fetchMore({
      variables: { ...variables, offset: listData.length },
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
  }, [listData, isAbleToLoadMore, fetchMore, variables]);

  const onRefetch = useCallback(async () => {
    await refetch({
      variables: {
        ...variables,
        limit: listData.length,
        offset: 0,
      },
    }).catch(onError);
  }, [listData, variables]);

  const isHasData = useMemo(() => {
    return listTotal > 0;
  }, [loading, listTotal]);

  const listError = useMemo(() => {
    if (!queryError) return undefined;
    return t`Load data failed.`;
  }, [queryError]);

  const isEmpty = useMemo(() => {
    return !!queryData && listTotal === 0 && !queryError;
  }, [loading, listTotal]);

  const isHasError = useMemo(() => {
    return !!queryError;
  }, [queryError]);

  // Event listener
  const events = args.events ?? [];
  const onEvent = useCallback(
    async (e: EventFragment) => {
      try {
        if (
          e.actionType &&
          (
            [EventDataActionType.Create, EventDataActionType.Archived] as EventDataActionType[]
          ).includes(e.actionType)
        ) {
          const response = await client
            .query<UseGraphqlListData<T>>({
              query: args.query,
              variables,
              fetchPolicy: "network-only",
            })
            .catch((error) => {
              console.error("Failed to fetch data for event: ", error);
            });

          if (response?.data && response.data.list.total !== listTotal) {
            setTotalChange(response.data.list.total - listTotal);
          }

          return;
        }

        if (e.ref && e.actionType === EventDataActionType.Update) {
          await client
            .query<UseGraphqlListData<T>>({
              query: args.query,
              variables: { query: { userId: [e.ref] } },
              fetchPolicy: "network-only",
            })
            .then((result) => {
              if (args.debug) {
                console.info("Fetched data for archived event: ", result);
              }
            })
            .catch((error) => console.error("Failed to fetch data for update event: ", error));
        }
      } catch (error) {
        console.error(error);
      }
    },
    [args.query, variables, listTotal, args.debug],
  );

  useEventsListener(
    events,
    (e) => {
      if (isReadyToFetch) onEvent(e);
    },
    [onEvent, isReadyToFetch],
  );

  // Auto fetch when server reconnected
  onReconnected(() => {
    if (autoFetch && isReadyToFetch && (queryData || queryError)) {
      refetch();
    }
  }, [JSON.stringify(params), autoFetch, listKey, isReadyToFetch]);

  if (args.debug) {
    console.info("useGraphqlList debug: ", {
      loading,
      isFetchingMore,
      isInitialized: !!queryData || !!queryError,
      listData,
      isEmpty,
      isHasData,
      isAbleToLoadMore,
    });
  }

  const isInitialized = useMemo(() => {
    return !!queryData || !!queryError;
  }, [queryData, queryError]);

  return {
    isInitialized,
    isFetching: isFetchingMore || (!isInitialized && loading),
    data: listData,
    total: listTotal,
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
            {},
          ),
        ),
        { scroll: false },
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
    totalChange,
    refetch: async () => {
      if (!queryData) await fetch({ variables });
      await onRefetch();
    },
    fetch,
  };
};

export type UseGraphqlList<T extends BaseData> = ReturnType<typeof useGraphqlList<T>>;
