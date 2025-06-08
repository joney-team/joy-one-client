import { NetworkMode, UseQueryResult, useQuery as useQueryTanstack } from "@tanstack/react-query";

import { AxiosError } from "axios";
import { api } from ".";
import { useEventsListener } from "../events/event-service";
import { EventEntity, EventType } from "../events/event-types";

export interface UseQueryArgs<T> {
  params?: Record<string, any>,
  isSkip?: boolean;
  refetchEvents?: EventType[]
  refetchCondition?: (data: EventEntity, currentData: T) => boolean;
  method?: 'get' | 'post';
  networkMode?: 'offlineFirst' | 'onlineFirst' | 'idle';
}

export type UseQuery<T> = UseQueryResult<T, AxiosError<unknown, any>>

export const useQuery = <T = any>(query: string | (UseQueryArgs<T> & { route: string })): UseQuery<T> => {
  const isReadyToFetch = typeof query === 'string' ? true : !query.isSkip;
  const args = typeof query === 'string' ? {} as UseQueryArgs<T> : query;
  const route = typeof query === 'string' ? query : query.route;
  const params = typeof query === 'string' ? null : query.params;
  const networkMode = typeof args.networkMode === 'string' ? args.networkMode as NetworkMode : 'offlineFirst';

  const stack = useQueryTanstack<T, AxiosError>({
    queryKey: [route, params],
    queryFn: ({ signal }) => {
      if (args.method === 'post') {
        return api.post<T>(route, args.params, { signal });
      }

      return api.get<T>(route, { params: args.params, signal });
    },
    enabled: isReadyToFetch,
    networkMode,
  });

  // Event listener
  const refetchEvents = args?.refetchEvents || [];

  useEventsListener(refetchEvents, (e) => {
    if (isReadyToFetch && refetchEvents.length > 0 && stack.data) {
      const condition = args?.refetchCondition;
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