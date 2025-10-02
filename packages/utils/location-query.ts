export const combinePathname = (params: URLSearchParams, pathname?: string) => {
  const _pathname = pathname || window.location.pathname;
  if (params.size > 0) return `${_pathname}?${params.toString()}`;
  return _pathname;
};

export const addParams = (...params: Record<string, string>[]) => {
  const query = new URLSearchParams(window.location.search);
  params.forEach((param) => {
    Object.keys(param).forEach((key) => {
      query.set(key, param[key]);
    });
  });
  return combinePathname(query);
};

export const removeParams = (...params: string[]) => {
  const query = new URLSearchParams(window.location.search);
  params.forEach((param) => {
    query.delete(param);
  });
  return combinePathname(query);
};
