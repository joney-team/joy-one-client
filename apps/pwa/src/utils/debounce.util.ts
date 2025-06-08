export function debounce<T = any>(func: T, delay: number) {
  let timeoutId: NodeJS.Timeout;

  return  (...args: any) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      // @ts-ignore
      func.apply(this as any, args);
    }, delay);
  };
}
