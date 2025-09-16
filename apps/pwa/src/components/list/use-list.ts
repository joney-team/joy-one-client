"use client";

import { useRouter } from "@/hooks/use-router";
import { onReconnected, useEventsListener } from "@/modules/events/event-service";
import { EventDataActionType, EventEntity, EventType } from "@/modules/events/event-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getWorkspaceId } from "@/modules/workspaces/workspaces-service";
import { CanceledError } from "axios";
import { usePathname, useSearchParams } from "next/navigation";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { isPlural } from "../../utils/string.utils";
import { BaseData } from "./types";
import { getId } from "./utils";

export interface UseListFetchReponse<T = any> {
  data: T[];
  count: number;
  report?: any;
}

export type UseListArgsFetch<T = any> = (
  query: any,
  controller: AbortController
) => Promise<UseListFetchReponse<T>> | UseListFetchReponse<T>;

export interface UseListArgs<T = any> {
  id?: string;
  isSkip?: boolean;
  params?: Record<string, any>;
  initialData?: T[];
  limit?: number;
  autoFetch?: boolean;
  fetch: UseListArgsFetch<T>;
  events?:
    | EventType[]
    | {
        types: EventType[];
        condition?: (data: EventEntity, currentData: T[]) => boolean;
      };
  isRefetchAllEvents?: boolean;
}

export type UseListFetch<T = any> = (
  isReset?: boolean,
  options?: { isSilient?: boolean; addonQuery?: any }
) => Promise<UseListFetchReponse<T> | void>;
export type UseListSetParam = (
  key: string,
  value: any | any[],
  options?: { isSilient?: boolean }
) => void;
export type UseListSetParams = (
  params: { [key: string]: any | any[] },
  options?: { isSilient?: boolean; isReplace?: boolean }
) => void;
export type UseListRemoveParam = (key: string, options?: { isSilient?: boolean }) => void;
export type UseListRemoveParams = (keys: string[], options?: { isSilient?: boolean }) => void;
export type UseListRemoveAllParams = (options?: { isSilient?: boolean }) => void;
export type UseListSetData<T = any> = (data: T[], count?: number) => void;
export type UseListSetStatus = (status: { isFetching?: boolean; isInitialized?: boolean }) => void;

export interface UseList<T extends BaseData> {
  isInitialized: boolean;
  isFetching: boolean;
  data: T[];
  limit: number;
  count: number;
  error?: string;
  report?: any;
  fetch: UseListFetch<T>;
  params: Record<string, any>;
  isHasError: boolean;
  isHasData: boolean;
  isEmpty: boolean;
  isAbleToLoadMore: boolean;
  loadMore: () => Promise<UseListFetchReponse<T> | void>;
  setData: UseListSetData<T>;
  setParam: UseListSetParam;
  setParams: UseListSetParams;
  removeParam: UseListRemoveParam;
  removeParams: UseListRemoveParams;
  removeAllParams: UseListRemoveAllParams;
  ref: MutableRefObject<UseListData<T>>;
  setStatus: UseListSetStatus;
  version: number;
  reset: () => void;
  newDataCount: number;
}

export interface UseListData<T extends BaseData> {
  data: T[];
  count: number;
  error?: string;
  report?: any;
}

let dataCached: any = {};

export const useList = <T extends BaseData>(args: UseListArgs<T>): UseList<T> => {
  const searchs = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const workspace = useWorkspace();
  const controller = useRef(new AbortController());

  const isReadyToFetch = typeof args.isSkip === "boolean" ? !args.isSkip : true;
  const listKey = args.id ? args.id.replace(/-/g, "") : undefined;
  const cacheId = args.id
    ? `${listKey}-${JSON.stringify(args.params || "p")}-${getWorkspaceId()}`
    : undefined;
  const cachedData = cacheId ? dataCached[cacheId] : undefined;
  const autoFetch = typeof args.autoFetch === "boolean" ? args.autoFetch : true;
  const limit = args.limit || 30;

  const [version, setVersion] = useState(0);
  const forceUpdate = () => setVersion((s) => s + 1);

  const status = useRef({
    isFetching: !cacheId || !cachedData,
    isInitialized: !!cacheId && !!cachedData,
    newDataCount: 0,
  });

  const stateQuery = useRef<any>({});

  const setStateQuery = (query: any) => {
    stateQuery.current = query;
    forceUpdate();
  };

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

  const [list, setList] = useState<UseListData<T>>(
    cachedData || {
      count: 0,
      data: [],
    }
  );

  const ref = useRef<UseListData<T>>(list);

  useEffect(() => {
    ref.current = list;
    if (cacheId && list.data && status.current.isInitialized) {
      dataCached[cacheId] = list;
    }
  }, [cacheId, list, version, status.current.isInitialized]);

  const onChangeQuery = () => {
    status.current.isFetching = true;
    setList({ count: 0, data: [] });
  };

  const fetch: UseListFetch = async (isReset, options) => {
    const _isSilient = typeof options?.isSilient === "boolean" ? options?.isSilient : false;
    const _isReset = typeof isReset === "boolean" ? isReset : true;

    if (!_isSilient) {
      status.current.isFetching = true;

      if (_isReset) {
        setList((s) => ({
          ...s,
          data: [],
          count: 0,
          error: undefined,
          report: undefined,
        }));
      }
    }

    let response: UseListFetchReponse<T> | undefined = undefined;

    try {
      if (options?.addonQuery) {
        setStateQuery({ ...stateQuery.current, ...options.addonQuery });
      }

      response = await args.fetch(
        {
          offset: _isReset ? 0 : list.data.length,
          limit,
          ...params,
          ...stateQuery.current,
          ...options?.addonQuery,
        },
        controller.current
      );

      if (Array.isArray(response.data)) {
        setList((s) => ({
          ...s,
          data: _isReset
            ? response!.data
            : [
                ...list.data,
                ...response!.data.filter((v) => !list.data.some((k) => getId(k) === getId(v))),
              ],
          count: response!.count,
          report: response!.report,
          error: undefined,
        }));
      }

      if (_isReset) status.current.newDataCount = 0;
    } catch (error: any) {
      if (error instanceof CanceledError) {
      } else {
        setList((s) => ({
          ...s,
          error: error.message || "unknown_error",
        }));
      }
    } finally {
      status.current.isFetching = false;
      status.current.isInitialized = true;
      forceUpdate();
    }

    return response;
  };

  // Auto fetch when component is mounted
  useEffect(() => {
    if (autoFetch && isReadyToFetch) {
      fetch(true, { isSilient: true });
    }
  }, [
    JSON.stringify(params),
    autoFetch,
    listKey,
    isReadyToFetch,
    workspace.userMember?.workspaceId,
  ]);

  // Auto fetch when server reconnected
  onReconnected(() => {
    if (autoFetch && isReadyToFetch && list.error) {
      fetch(true, { isSilient: true });
    }
  }, [JSON.stringify(params), autoFetch, listKey, isReadyToFetch, list.error]);

  // Abort controller
  useEffect(() => {
    controller.current = new AbortController();

    return () => {
      controller.current.abort();
    };
  }, []);

  // Event listener
  const events = Array.isArray(args.events) ? args.events : args.events?.types || [];
  const onEvent = async (e: EventEntity) => {
    try {
      if (args.isRefetchAllEvents) {
        return fetch(true, { isSilient: true });
      }

      if (e.actionType === EventDataActionType.ARCHIVED) {
        return;
      }

      if (e.actionType === EventDataActionType.CREATE) {
        const response = await args.fetch(
          { ...params, ...stateQuery.current },
          new AbortController()
        );
        if (response.count > list.count) {
          status.current.newDataCount = response.count - list.count;
          forceUpdate();
        }
        return;
      }

      // Update existed data
      const existed = list.data.find((v) => getId(v) === e.ref);
      if (existed) {
        const resonse = await args.fetch({ ids: [getId(existed)] }, new AbortController());
        const matched = resonse.data.find((v: T) => getId(v) === getId(existed));

        if (matched) {
          setList((l) => ({
            ...l,
            data: l.data.map((v) => {
              if (getId(v) === getId(matched)) return matched;
              return v;
            }),
          }));
        }
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
        if (condition && !condition(e, list.data)) return;
        onEvent(e);
      }
    },
    [args.events, listKey, params, isReadyToFetch, list.count]
  );

  const isAbleToLoadMore =
    !status.current.isFetching && list.data && list.count > list.data.length && !list.error;
  const isHasError = status.current.isInitialized && !status.current.isFetching && !!list.error;
  const isHasData = status.current.isInitialized && list.count > 0;
  const isEmpty =
    status.current.isInitialized &&
    !status.current.isFetching &&
    (list.data.length === 0 || list.count === 0) &&
    !!!list.error;

  return {
    isFetching: status.current.isFetching,
    isInitialized: status.current.isInitialized,
    version,
    data: list.data || [],
    count: list.count || 0,
    error: list.error,
    fetch,
    params,
    isHasError,
    isHasData,
    isEmpty,
    isAbleToLoadMore,
    loadMore: () => fetch(false, {}),
    ref,
    report: list.report,
    limit,
    setData: (data: T[], count?: number) =>
      setList((s) => ({
        ...s,
        data,
        count: typeof count === "number" ? count : s.count,
      })),
    setParam: (key, value, options) => {
      const _isSilient = typeof options?.isSilient === "boolean" ? options?.isSilient : false;
      if (!_isSilient) onChangeQuery();

      const params = new URLSearchParams(searchs.toString());
      const _key = key ? `${listKey}-${key}` : key;
      if (!value || value.length === 0) params.delete(_key);
      else params.set(_key, value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    setParams: (queries, options) => {
      const _isSilient = typeof options?.isSilient === "boolean" ? options.isSilient : false;
      const _isReplace = typeof options?.isReplace === "boolean" ? options.isReplace : false;
      if (!_isSilient) onChangeQuery();

      const params = new URLSearchParams(_isReplace ? "" : searchs.toString());
      Object.keys(queries).forEach((key) => {
        const _key = key ? `${listKey}-${key}` : key;
        if (!queries[key] || queries[key].length === 0) params.delete(_key);
        else params.set(_key, queries[key]);
      });

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    removeParam: (key, options) => {
      const _isSilient = typeof options?.isSilient === "boolean" ? options.isSilient : false;
      if (!_isSilient) onChangeQuery();

      const params = new URLSearchParams(searchs.toString());
      const _key = key ? `${listKey}-${key}` : key;
      params.delete(_key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    removeParams: (keys, options) => {
      const _isSilient = typeof options?.isSilient === "boolean" ? options.isSilient : false;
      if (!_isSilient) onChangeQuery();

      const params = new URLSearchParams(searchs.toString());
      keys.forEach((key) => {
        const _key = key ? `${listKey}-${key}` : key;
        params.delete(_key);
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    removeAllParams: (options) => {
      const _isSilient = typeof options?.isSilient === "boolean" ? options.isSilient : false;
      if (!_isSilient) onChangeQuery();

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
    reset: () =>
      setList({
        data: [],
        count: 0,
        error: undefined,
        report: undefined,
      }),
    setStatus: ({
      isFetching,
      isInitialized,
    }: {
      isFetching?: boolean;
      isInitialized?: boolean;
    }) => {
      if (typeof isFetching === "boolean") status.current.isFetching = isFetching;
      if (typeof isInitialized === "boolean") status.current.isInitialized = isInitialized;
      forceUpdate();
    },
    newDataCount: status.current.newDataCount,
  };
};
