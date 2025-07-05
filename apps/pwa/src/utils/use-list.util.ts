"use client"

import { useRouter } from "@/hooks/use-router";
import { onReconnected, useEventsListener } from "@/modules/events/event-service";
import { getWorkspaceId } from "@/modules/workspaces/workspaces-service";
import { usePathname, useSearchParams } from "next/navigation";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { isPlural } from "./string.utils";
import { EventEntity, EventType } from "@/modules/events/event-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";

export interface UseListFetchReponse<T = any> {
  data: T[];
  count: number;
  report?: any;
}

export type UseListArgsFetch<T = any> = (query: any, controller: AbortController) => Promise<UseListFetchReponse<T>> | UseListFetchReponse<T>;

export interface UseListArgs<T = any> {
  id?: string;
  isSkip?: boolean;
  initialQuery?: any;
  initialData?: T[];
  limit?: number;
  autoFetch?: boolean;
  fetch: UseListArgsFetch<T>;
  events?: EventType[] | ({
    types: EventType[];
    condition?: (data: EventEntity, currentData: T[]) => boolean;
  })
}

export type UseListFetch<T = any> = (isReset?: boolean, options?: { isSilient?: boolean, addonQuery?: any }) => Promise<UseListFetchReponse<T> | void>;
export type UseListSetQuery = (key: string, value: any | any[], options?: { isSilient?: boolean }) => void;
export type UseListSetQueries = (queries: { [key: string]: any | any[] }, options?: { isSilient?: boolean, isReplace?: boolean }) => void;
export type UseListRemoveQuery = (key: string, options?: { isSilient?: boolean }) => void;
export type UseListRemoveQueries = (keys: string[], options?: { isSilient?: boolean }) => void;
export type UseListRemoveAllQueries = (options?: { isSilient?: boolean }) => void;
export type UseListSetData<T = any> = (data: T[], count?: number) => void;
export type UseListSetStatus = (status: { isFetching?: boolean, isInitialized?: boolean }) => void;


export interface UseList<T = any> {
  isInitialized: boolean;
  isFetching: boolean;
  data: T[];
  limit: number;
  count: number;
  error?: string;
  report?: any;
  fetch: UseListFetch<T>;
  query: any;
  isHasError: boolean;
  isHasData: boolean;
  isEmpty: boolean;
  isAbleToLoadMore: boolean;
  loadMore: () => Promise<UseListFetchReponse<T> | void>;
  setData: UseListSetData<T>;
  setQuery: UseListSetQuery;
  setQueries: UseListSetQueries;
  removeQuery: UseListRemoveQuery;
  removeQueries: UseListRemoveQueries;
  removeAllQueries: UseListRemoveAllQueries;
  ref: MutableRefObject<UseListData<T>>;
  setStatus: UseListSetStatus;
  version: number;
  reset: () => void;
}

export interface UseListData<T = any> {
  data: T[];
  count: number;
  error?: string;
  report?: any;
}

let dataCached: any = {}

export const useList = <T = any>(args: UseListArgs<T>): UseList<T> => {
  const searchs = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const controller = useRef(new AbortController());
  const workspace = useWorkspace();

  const isReadyToFetch = typeof args.isSkip === 'boolean' ? !args.isSkip : true;
  const listKey = args.id ? args.id.replace(/-/g, '') : undefined;
  const cacheId = listKey ? `${listKey}-${getWorkspaceId()}` : undefined;
  const cachedData = cacheId ? dataCached[cacheId] : undefined;
  const autoFetch = typeof args.autoFetch === 'boolean' ? args.autoFetch : true;
  const limit = args.limit || 30;

  const [version, setVersion] = useState(0);
  const forceUpdate = () => setVersion(s => s + 1);

  const status = useRef({
    isFetching: !cacheId || !cachedData,
    isInitialized: !!cacheId && !!cachedData,
  })

  const stateQuery = useRef<any>({});

  const setStateQuery = (query: any) => {
    stateQuery.current = query;
    forceUpdate();
  }

  const getQuery = () => {
    let query: any = {};
    if (listKey) {
      searchs.forEach((value, key) => {
        const prefix = key.split('-')[0];
        if (prefix === listKey) {
          const _key = key.split('-').slice(1).join('-');
          if (isPlural(key)) query[_key] = value.split(',');
          else query[_key] = value;
        }
      })
    } else {
      searchs.forEach((value, key) => {
        const prefix = key.split('-');
        if (prefix.length === 1) query[key] = value;
      })
    }

    return query;
  }

  const query: any = getQuery();

  const [list, setList] = useState<UseListData<T>>(cachedData || {
    count: 0,
    data: [],
  });

  const ref = useRef<UseListData<T>>(list);

  useEffect(() => {
    ref.current = list;
    if (cacheId && list.data && status.current.isInitialized) {
      dataCached[cacheId] = list;
    }
  }, [cacheId, list, version, status.current.isInitialized])

  const onChangeQuery = () => {
    status.current.isFetching = true;
    setList({ count: 0, data: [] });
  }

  const fetch: UseListFetch = async (isReset, options) => {
    const _isSilient = typeof options?.isSilient === 'boolean' ? options?.isSilient : false;
    const _isReset = typeof isReset === 'boolean' ? isReset : true;

    if (!_isSilient) {
      status.current.isFetching = true;

      if (_isReset) setList(s => ({
        ...s,
        data: [],
        count: 0,
        error: undefined,
        report: undefined
      }))

      forceUpdate();
    }

    let response: UseListFetchReponse<T> | undefined = undefined;

    try {
      let combinedQuery = { ...query, ...stateQuery.current };

      if (options?.addonQuery) {
        combinedQuery = { ...combinedQuery, ...options.addonQuery };
        setStateQuery({ ...stateQuery.current, ...options.addonQuery });
      }

      response = await args.fetch({
        offset: _isReset ? 0 : list.data.length,
        limit,
        ...args.initialQuery,
        ...combinedQuery,
      }, controller.current);

      if (Array.isArray(response.data)) {
        setList(s => ({
          ...s,
          data: _isReset ? response!.data : [...list.data, ...response!.data],
          count: response!.count,
          report: response!.report,
          error: undefined,
        }));
      }
    } catch (error: any) {
      setList(s => ({
        ...s,
        error: error.message || 'unknown_error',
      }));
    } finally {
      status.current.isFetching = false;
      status.current.isInitialized = true;
      forceUpdate();
    }

    return response;
  }

  // Auto fetch when component is mounted
  useEffect(() => {
    if (autoFetch && isReadyToFetch) {
      fetch(true, { isSilient: true });
    }
  }, [JSON.stringify(query), autoFetch, listKey, isReadyToFetch, workspace.userMember?.workspaceId])

  // Auto fetch when server reconnected
  onReconnected(() => {
    if (autoFetch && isReadyToFetch) {
      fetch(true, { isSilient: true });
    }
  }, [JSON.stringify(query), autoFetch, listKey, isReadyToFetch])

  // Abort controller
  useEffect(() => {
    return () => {
      controller.current.abort();
    }
  }, [])

  // Event listener
  const events = Array.isArray(args.events) ? args.events : args.events?.types || [];
  useEventsListener(events, (e) => {
    if (isReadyToFetch) {
      const condition = args.events && 'condition' in args.events ? args.events.condition : undefined;
      if (condition && !condition(e, list.data)) return;
      fetch(true, { isSilient: true });
    }
  }, [args.events, listKey, isReadyToFetch])

  const isAbleToLoadMore = !status.current.isFetching && list.data && list.count > list.data.length && !list.error;
  const isHasError = status.current.isInitialized && !status.current.isFetching && !!list.error;
  const isHasData = status.current.isInitialized && list.count > 0;
  const isEmpty = status.current.isInitialized && !status.current.isFetching && (list.data.length === 0 || list.count === 0) && !!!list.error;

  return {
    isFetching: status.current.isFetching,
    isInitialized: status.current.isInitialized,
    version,
    data: list.data || [],
    count: list.count || 0,
    error: list.error,
    fetch,
    query,
    isHasError,
    isHasData,
    isEmpty,
    isAbleToLoadMore,
    loadMore: () => fetch(false, {}),
    ref,
    report: list.report,
    limit,
    setData: (data: T[], count?: number) => setList(s => ({
      ...s,
      data,
      count: typeof count === 'number' ? count : s.count,
    })),
    setQuery: (key, value, options) => {
      const _isSilient = typeof options?.isSilient === 'boolean' ? options?.isSilient : false;
      if (!_isSilient) onChangeQuery();

      const params = new URLSearchParams(searchs.toString());
      const _key = key ? `${listKey}-${key}` : key;
      if (!value || value.length === 0) params.delete(_key);
      else params.set(_key, value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    setQueries: (queries, options) => {
      const _isSilient = typeof options?.isSilient === 'boolean' ? options.isSilient : false;
      const _isReplace = typeof options?.isReplace === 'boolean' ? options.isReplace : false;
      if (!_isSilient) onChangeQuery();

      const params = new URLSearchParams(_isReplace ? '' : searchs.toString());
      Object.keys(queries).forEach((key) => {
        const _key = key ? `${listKey}-${key}` : key;
        if (!queries[key] || queries[key].length === 0) params.delete(_key);
        else params.set(_key, queries[key]);
      })

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    removeQuery: (key, options) => {
      const _isSilient = typeof options?.isSilient === 'boolean' ? options.isSilient : false;
      if (!_isSilient) onChangeQuery();

      const params = new URLSearchParams(searchs.toString());
      const _key = key ? `${listKey}-${key}` : key;
      params.delete(_key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    removeQueries: (keys, options) => {
      const _isSilient = typeof options?.isSilient === 'boolean' ? options.isSilient : false;
      if (!_isSilient) onChangeQuery();

      const params = new URLSearchParams(searchs.toString());
      keys.forEach((key) => {
        const _key = key ? `${listKey}-${key}` : key;
        params.delete(_key);
      })
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    removeAllQueries: (options) => {
      const _isSilient = typeof options?.isSilient === 'boolean' ? options.isSilient : false;
      if (!_isSilient) onChangeQuery();

      const params = new URLSearchParams(searchs.toString());
      if (listKey) {
        searchs.forEach((_, key) => {
          if (key.split('-')[0] === listKey) params.delete(key);
        })
      } else {
        searchs.forEach((_, key) => {
          if (key.split('-').length === 1) params.delete(key);
        })
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    reset: () => setList({
      data: [],
      count: 0,
      error: undefined,
      report: undefined,
    }),
    setStatus: ({ isFetching, isInitialized }: { isFetching?: boolean, isInitialized?: boolean }) => {
      if (typeof isFetching === 'boolean') status.current.isFetching = isFetching;
      if (typeof isInitialized === 'boolean') status.current.isInitialized = isInitialized;
      forceUpdate();
    },
  }
}