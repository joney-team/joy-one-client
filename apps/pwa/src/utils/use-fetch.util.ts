import { useLocalStorage } from "@/hooks/use-local-storage";
import { useEventsListener } from "@/modules/events/event-service";
import { EventEntity } from "@/modules/events/event-types";
import { EventType } from "@/graphql/enums.graphql";
import { StorageKey } from "@/types";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { objClean } from "./object.utils";

export interface UseFetchArgs<T = any> {
  id?: string;
  initialData?: T;
  fetch: (query: any, controller: AbortController) => Promise<T | undefined>;
  reset?: boolean;
  skip?: boolean;
  autoFetch?: boolean;
  refetchEvents?:
    | EventType[]
    | {
        types: EventType[];
        condition?: (data: EventEntity, currentData: T) => boolean;
      };
  default?: T;
  isAlwayRefetchWhenReconnect?: boolean;
}

let dataCached: any = {};

export interface UseFetchOptions {
  isSilient?: boolean;
  throwError?: boolean;
  query?: any;
}

export type UseFetchFetch<T = any> = (options?: UseFetchOptions) => Promise<T | undefined>;

export interface UseFetch<T = any> {
  data?: T;
  isFetching: boolean;
  isInitialized: boolean;
  fetch: UseFetchFetch<T>;
  setData: (data: T) => void;
  reset: () => void;
  error?: string;
  skip?: boolean;
  errorStatus?: number;
  version: number;
}

export function useFetch<T = any>(args: UseFetchArgs<T>, deps?: any[]): UseFetch<T> {
  const [workspaceId] = useLocalStorage(StorageKey.WORKSPACE_ID);
  const fetchKey = args.id ? args.id.replace(/-/g, "") + workspaceId : workspaceId;
  const cacheId = args.id ? `${args.id.replace(/-/g, "")}-${workspaceId}` : "";
  const autoFetch = typeof args.autoFetch === "boolean" ? args.autoFetch : true;
  const isReadyToFetch = typeof args.skip === "boolean" ? !args.skip : true;

  const controller = useRef(new AbortController());

  const cached: T = args.initialData || dataCached[cacheId || "none"];

  const [version, setVersion] = useState(0);
  const forceUpdate = () => setVersion((s) => s + 1);

  const status = useRef({
    isFetching: !cached,
    isInitialized: !!cached,
  });

  const [state, setState] = useState<{
    data?: T;
    error?: string;
    errorStatus?: number;
  }>({ data: cached || args.default });

  const fetch: UseFetchFetch<T> = async (options) => {
    const isSilient = typeof options?.isSilient === "boolean" ? options.isSilient : false;
    const query = options?.query || {};

    if (!isSilient) {
      status.current.isFetching = true;
      forceUpdate();
    }

    try {
      const response = await args.fetch(query, controller.current);
      setState({ data: response });
      return response;
    } catch (error: any) {
      let errorMessage = error.message;
      let errorStatus = 0;

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
        if (error.response?.status) errorStatus = error.response?.status;
      }

      setState({ error: errorMessage, errorStatus });
      if (options?.throwError) throw error;
    } finally {
      status.current.isFetching = false;
      status.current.isInitialized = true;
      if (!isSilient) forceUpdate();
    }
  };

  // Sync cache data
  useEffect(() => {
    if (cacheId && state.data && status.current.isInitialized) {
      dataCached[cacheId] = state.data;
    }
  }, [cacheId, state.data, status.current.isInitialized]);

  // Auto fetch when component is mounted
  useEffect(() => {
    if (autoFetch && isReadyToFetch && !args.skip) fetch({ isSilient: true });
  }, [autoFetch, isReadyToFetch, fetchKey, args.skip, ...(deps || [])]);

  // Auto fetch when server reconnected
  // onReconnected(() => {
  //   if ((!!state.error || args.isAlwayRefetchWhenReconnect) && isReadyToFetch) {
  //     fetch({ isSilient: true });
  //   }
  // }, [state.error, isReadyToFetch, args.isAlwayRefetchWhenReconnect, fetchKey])

  // Abort controller
  useEffect(() => {
    return () => {
      controller.current?.abort();
    };
  }, []);

  // Event listener
  const isReadyToEventListen = isReadyToFetch && state.data;
  const events = Array.isArray(args.refetchEvents)
    ? args.refetchEvents
    : args.refetchEvents?.types || [];

  useEventsListener(
    events,
    (e) => {
      if (state.data) {
        const condition =
          args.refetchEvents && "condition" in args.refetchEvents
            ? args.refetchEvents.condition
            : undefined;
        if ((condition && !condition(e, state.data)) || !isReadyToEventListen) return;
        fetch({ isSilient: true });
      }
    },
    [args.refetchEvents, state.data, isReadyToEventListen, fetchKey]
  );

  return objClean({
    ...status.current,
    version,
    fetch,
    setData: (data: T) => setState((state) => ({ ...state, data })),
    reset: () => setState((state) => ({ ...state, isInitialized: false, data: undefined })),
    data: state.data as T,
    error: state.error,
    errorStatus: state.errorStatus,
  });
}
