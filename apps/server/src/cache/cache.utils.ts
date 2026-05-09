import { CacheKey } from './cache.types';

export function stableString(obj: object): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

export function normalizeCacheKey(key: CacheKey): string {
  if (typeof key === 'string') return key;
  return typeof key === 'object' ? stableString(key) : key;
}
