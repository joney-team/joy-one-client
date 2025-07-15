import { NetworkMode, UseQueryResult, useQuery as useQueryTanstack } from "@tanstack/react-query";

import { AxiosError } from "axios";
import { api } from ".";
import { useEventsListener } from "../events/event-service";
import { EventEntity, EventType } from "../events/event-types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { StorageKey } from "@/types";

export interface UseQueryArgs<T> {
  params?: Record<string, any>,
  isSkip?: boolean;
  refetchEvents?: EventType[]
  refetchCondition?: (data: EventEntity, currentData: T) => boolean;
  method?: 'get' | 'post';
  networkMode?: NetworkMode;
  queryKey?: string[];
}

export type UseQuery<T> = UseQueryResult<T, AxiosError<unknown, any>>

export const useQuery = <T = any>(args: string | (UseQueryArgs<T> & { route: string })): UseQuery<T> => {
  const isReadyToFetch = typeof args === 'string' ? true : !args.isSkip;
  const query = typeof args === 'string' ? {} as UseQueryArgs<T> : args;
  const route = typeof args === 'string' ? args : args.route;
  const params = typeof args === 'string' ? null : args.params;
  const queryKey = typeof args === 'string' ? [] : args.queryKey || [];
  const networkMode = query.networkMode ?? 'offlineFirst';
  const [workspaceId] = useLocalStorage(StorageKey.WORKSPACE_ID);

  const stack = useQueryTanstack<T, AxiosError>({
    queryKey: [...queryKey, route, params, workspaceId || 'general'],
    queryFn: ({ signal }) => {
      if (query.method === 'post') {
        return api.post<T>(route, query.params, { signal });
      }

      return api.get<T>(route, { params: query.params, signal });
    },
    enabled: isReadyToFetch,
    networkMode,
  });

  // Event listener
  const refetchEvents = query?.refetchEvents || [];

  useEventsListener(refetchEvents, (e) => {
    if (isReadyToFetch && refetchEvents.length > 0 && stack.data) {
      const condition = query?.refetchCondition;
      if (condition && !condition(e, stack.data)) return;
      stack.refetch().catch(console.error);
    }
  }, [refetchEvents, isReadyToFetch, route, params])

  return stack
}

export interface UseDynmicQueryArgs<T> {
  key?: string;
  queryFn: (args: { signal: AbortSignal }) => Promise<T>;
  isSkip?: boolean;
  refetchEvents?: EventType[]
  refetchCondition?: (data: EventEntity, currentData: T) => boolean;
}

export type UseDynmicQuery<T> = UseQueryResult<T, AxiosError>

export function useDynmicQuery<T = any>(args: UseDynmicQueryArgs<T>): UseDynmicQuery<T> {
  const { key, queryFn, isSkip } = args;
  const isReadyToFetch = !isSkip;
  const queryKey = key || '';

  const stack = useQueryTanstack<T, AxiosError>({
    queryKey: [queryKey],
    queryFn,
  });

  // Event listener
  const refetchEvents = args?.refetchEvents || [];

  useEventsListener(refetchEvents, (e) => {
    if (isReadyToFetch && refetchEvents.length > 0 && stack.data) {
      const condition = args?.refetchCondition;
      if (condition && !condition(e, stack.data)) return;
      stack.refetch().catch(console.error);
    }
  }, [refetchEvents, queryKey, isReadyToFetch])

  return stack;
}