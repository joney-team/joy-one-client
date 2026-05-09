export function processAsync<T extends readonly unknown[]>(promises: {
  [K in keyof T]: Promise<T[K]>;
}): Promise<T> {
  return Promise.all(promises) as Promise<T>;
}
