import { defaultRouteRule, routeRules } from "@/configs/routes.config";
import { AppRouterInstance, NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter as useNextRouter, usePathname } from "next/navigation";
import { useMemo } from "react";

export interface AppRouter extends Omit<AppRouterInstance, 'push'> {
  pathname: string;
  back: () => void;
  setQuery: (key: string, value?: string, replace?: boolean) => void;
  setQueries: (queries: { [key: string]: string }, replace?: boolean) => void;
  removeQuery: (key: any, replace?: boolean) => void;
  removeQueries: (keys: string[], replace?: boolean) => void;
  removeAllQueries: () => void;
  href: (route: string) => string
  push: (route: string, query?: { [key: string]: string | number }, options?: NavigateOptions) => void | Promise<void>;
}

export const getParams = (params: URLSearchParams, pathname?: string) => {
  if (params.size === 0) return pathname || '';
  if (pathname) return pathname + '?' + params.toString();
  return '?' + params.toString();
}

export const useRouter = (): AppRouter => {
  const router = useNextRouter();
  const pathname = usePathname();

  const href = (route: string) => {
    const search = window.location.search;
    let _route = route;
    const params = new URLSearchParams(search);
    if (params.size > 0) {
      _route += getParams(params);
    }
    return _route;
  }

  return {
    ...router,
    pathname,
    href,
    push: (route, query, opts) => {
      let _route = route;
      const params = new URLSearchParams(window.location.search);

      // Add query params
      Object.keys(query || {}).forEach(key => {
        params.set(key, (query as any)[key].toString());
      });

      // Add param to route
      if (params.size > 0) _route += getParams(params);

      router.push(_route, opts);
    },
    back: () => {
      if (window.history.length > 1) {
        return router.back();
      }

      return router.push('/');
    },
    setQuery: (key, value, replace) => {
      const params = new URLSearchParams(window.location.search);
      if (value && value !== null) params.set(key, value);
      else params.delete(key);
      if (replace) return router.replace(`${pathname}${getParams(params)}`);
      return router.push(`${pathname}${getParams(params)}`);
    },
    removeQuery: (key, replace) => {
      const params = new URLSearchParams(window.location.search);
      params.delete(key);
      if (replace) return router.replace(`${pathname}${getParams(params)}`);
      return router.push(`${pathname}${getParams(params)}`);
    },
    setQueries: (queries, replace) => {
      const params = new URLSearchParams(window.location.search);
      Object.keys(queries).forEach(key => {
        if (queries[key]) params.set(key, queries[key]);
        else params.delete(key);
      })
      if (replace) return router.replace(`${pathname}${getParams(params)}`);
      return router.push(`${pathname}${getParams(params)}`);
    },
    removeQueries: (keys, replace) => {
      const params = new URLSearchParams(window.location.search);
      keys.forEach(key => params.delete(key));
      if (replace) return router.replace(`${pathname}${getParams(params)}`);
      return router.push(`${pathname}${getParams(params)}`);
    },
    removeAllQueries: () => {
      return router.replace(pathname);
    }
  }
}

export const useRouteRule = () => {
  const pathname = usePathname();
  return useMemo(() => routeRules[pathname] || defaultRouteRule, [pathname]);
}