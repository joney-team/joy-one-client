import { NetworkMode, UseQueryResult, useQuery as useQueryTanstack } from "@tanstack/react-query";

import { EventType } from "@/graphql/types.graphql";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { StorageKey } from "@/constants/storage-key";
import { AxiosError } from "axios";
import { useMemo } from "react";
import { restClient } from "./rest-client";
import { onReconnected, useEventsListener } from "../events/event-service";
import { EventDataFragment } from "../events/graphql/fragmentEvent.graphql";

export interface UseRestQueryArgs<T, P = Record<string, any>> {
  params?: P;
  isSkip?: boolean;
  refetchEvents?: EventType[];
  refetchCondition?: (data: EventDataFragment, currentData: T) => boolean;
  refetchWhenReconnected?: boolean;
  method?: "get" | "post";
  networkMode?: NetworkMode;
  queryKey?: string[];
}

export type UseRestQuery<T> = UseQueryResult<T, AxiosError<unknown, any>>;

export const useRestQuery = <T = any, P = Record<string, any>>(
  args: string | (UseRestQueryArgs<T, P> & { route: string }),
): UseRestQuery<T> => {
  const isReadyToFetch = typeof args === "string" ? true : !args.isSkip;
  const query = typeof args === "string" ? ({} as UseRestQueryArgs<T>) : args;
  const route = typeof args === "string" ? args : args.route;
  const params = typeof args === "string" ? null : args.params;
  const queryKey = typeof args === "string" ? [] : args.queryKey || [];
  const networkMode = query.networkMode ?? "offlineFirst";
  const [workspaceId] = useLocalStorage(StorageKey.WORKSPACE_ID);
  const refetchWhenReconnected = query.refetchWhenReconnected ?? false;

  const queryKeyIn = useMemo(() => {
    return [...queryKey, route, params ? JSON.stringify(params) : "pn", workspaceId || "general"];
  }, [queryKey, route, params, workspaceId]);

  const stack = useQueryTanstack<T, AxiosError>({
    queryKey: queryKeyIn,
    queryFn: ({ signal }) => {
      if (query.method === "post") {
        return restClient.post<T>(route, query.params, { signal });
      }

      return restClient.get<T>(route, { params: query.params, signal });
    },
    enabled: isReadyToFetch,
    networkMode,
  });

  // Event listener
  const refetchEvents = useMemo(() => {
    return query?.refetchEvents || [];
  }, [query.refetchEvents]);

  useEventsListener(
    refetchEvents,
    (e) => {
      if (isReadyToFetch && refetchEvents.length > 0 && stack.data) {
        const condition = query?.refetchCondition;
        if (condition && !condition(e, stack.data)) return;
        stack.refetch().catch(console.error);
      }
    },
    [refetchEvents, isReadyToFetch, route, params],
  );

  onReconnected(() => {
    if (refetchWhenReconnected) {
      stack.refetch().catch(console.error);
    }
  }, [refetchWhenReconnected, stack]);

  return stack;
};

export interface UseDynmicRestQueryArgs<T> {
  key?: string;
  queryFn: (args: { signal: AbortSignal }) => Promise<T>;
  isSkip?: boolean;
  refetchEvents?: EventType[];
  refetchCondition?: (data: EventDataFragment, currentData: T) => boolean;
}

export type UseDynmicRestQuery<T> = UseQueryResult<T, AxiosError>;

export function useDynmicRestQuery<T = any>(
  args: UseDynmicRestQueryArgs<T>,
): UseDynmicRestQuery<T> {
  const { key, queryFn, isSkip } = args;
  const isReadyToFetch = !isSkip;
  const queryKey = key || "";

  const stack = useQueryTanstack<T, AxiosError>({
    queryKey: [queryKey],
    queryFn,
  });

  // Event listener
  const refetchEvents = args?.refetchEvents || [];

  useEventsListener(
    refetchEvents,
    (e) => {
      if (isReadyToFetch && refetchEvents.length > 0 && stack.data) {
        const condition = args?.refetchCondition;
        if (condition && !condition(e, stack.data)) return;
        stack.refetch().catch(console.error);
      }
    },
    [refetchEvents, queryKey, isReadyToFetch],
  );

  return stack;
}
