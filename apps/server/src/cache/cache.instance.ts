import { CacheService } from './cache.service';
import { CacheKey } from './cache.types';
import { normalizeCacheKey } from './cache.utils';

export interface CacheInstanceConfig {
  expireTime?: number; // in seconds
}

export class CacheInstance<T extends object> {
  instanceKey: CacheKey;
  set: (dataKey: CacheKey, data: T) => Promise<void>;
  get: (dataKey: CacheKey) => Promise<T | null>;
  clear: (dataKey: string) => Promise<void>;
  clearAll: () => Promise<void>;
  config?: CacheInstanceConfig;

  constructor(
    private readonly redis: CacheService,
    instanceKey: CacheKey,
    fallback?: () => Promise<T>,
    config?: CacheInstanceConfig,
  ) {
    this.instanceKey = normalizeCacheKey(instanceKey);
    this.config = config;

    const combineDataKey = (key: CacheKey): string => {
      return `${this.instanceKey}:${normalizeCacheKey(key)}`;
    };

    this.set = async (dataKey, data: T) => {
      const combinedDataKey = combineDataKey(dataKey);
      await this.redis.set(combinedDataKey, data, {
        expiration: config?.expireTime
          ? { type: 'EX', value: config.expireTime }
          : { type: 'EX', value: 60 * 5 }, // default to 5 minutes
      });
      await this.redis.sAdd(this.instanceKey, combinedDataKey);
    };

    this.get = async (dataKey) => {
      const cached = await this.redis.get<T>(combineDataKey(dataKey));

      if (cached) {
        return cached;
      }

      if (fallback) {
        const data = await fallback();
        this.set(dataKey, data);
        return data;
      }

      return null;
    };

    this.clear = async (dataKey) => {
      await this.redis.clear(combineDataKey(dataKey));
    };

    this.clearAll = async () => {
      await this.redis.removeGroup(this.instanceKey);
    };
  }
}
