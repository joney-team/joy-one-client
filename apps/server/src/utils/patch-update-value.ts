export function patchUpdateValue<T = any>(
  value: T | undefined,
  defaultValue: T,
): T {
  if (typeof value !== 'undefined') return value as T;
  return defaultValue;
}
