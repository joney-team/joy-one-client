import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SetOptions } from 'redis';
import { logger } from 'src/app.logger';
import { configs, IS_TESTING } from 'src/config/config';
import { CacheInstance, CacheInstanceConfig } from './cache.instance';
import { CacheKey } from './cache.types';
import { normalizeCacheKey } from './cache.utils';

const version = 'v15';

const defaultSetOptions: SetOptions = {
  expiration: { type: 'EX', value: 60 * 5 },
};

@Injectable()
export class CacheService implements OnModuleInit {
  client: ReturnType<typeof createClient>;
  isInitialized = false;
  isFailed = false;

  // Redis is not available in test environment
  isAvailable = !IS_TESTING;

  constructor() {}

  async onModuleInit() {
    if (!this.isAvailable) return;

    this.client = createClient({
      url: configs.REDIS_URL,
      socket: {
        reconnectStrategy: (times) => {
          if (times >= 5) return 1000 * 60;
          return 1000 * 5;
        },
      },
    });

    this.client.on('error', (error) => {
      if (this.isFailed) return;
      this.isFailed = true;
      logger.error(error, {
        case: 'Redis connection failed',
      });
    });

    this.client.on('connect', () => {
      if (this.isInitialized) {
        logger.info('Redis reconnected');
        this.isFailed = false;
      }
    });

    await this.client.connect();
    this.isInitialized = true;
  }

  async reset() {
    if (!this.isAvailable) return;
    await this.client.flushDb();
  }

  private combineKey(key: CacheKey): string {
    const cacheKey = normalizeCacheKey(key);
    return `${configs.APP_NAME}-${configs.ENV}-${cacheKey}-${version}`;
  }

  async set<T extends string | number | object>(
    key: CacheKey,
    data: T,
    opts?: SetOptions,
  ) {
    if (!this.isAvailable) return;
    try {
      await this.client.set(this.combineKey(key), JSON.stringify(data || {}), {
        ...defaultSetOptions,
        ...(opts ?? {}),
      });
    } catch (error: any) {
      logger.error(error);
    }
  }

  async sAdd(group: CacheKey, key: CacheKey) {
    if (!this.isAvailable) return;
    try {
      await this.client.sAdd(this.combineKey(group), this.combineKey(key));
    } catch (error: any) {
      logger.error(error);
    }
  }

  async removeGroup(group: CacheKey) {
    if (!this.isAvailable) return;

    try {
      const groupKey = this.combineKey(group);
      const keys = (await this.client.sMembers(groupKey)) as string[];

      if (keys.length > 0) {
        await this.client.del(keys);
      }

      await this.client.del(groupKey);
    } catch (error: any) {
      logger.error(error);
    }
  }

  async clear(key: CacheKey) {
    if (!this.isAvailable) return;
    try {
      await this.client.del(this.combineKey(key));
    } catch (error: any) {
      logger.error(error);
    }
  }

  async get<T = any>(key: CacheKey): Promise<T | null> {
    if (!this.isAvailable) return null;

    try {
      const cached = await this.client.get(this.combineKey(key));
      const parsed = JSON.parse(String(cached));
      return parsed;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  instance<T extends object>(args: {
    instanceKey: CacheKey;
    fallback?: () => Promise<T>;
    config?: CacheInstanceConfig;
  }) {
    return new CacheInstance<T>(
      this,
      args.instanceKey,
      args.fallback,
      args.config,
    );
  }
}
