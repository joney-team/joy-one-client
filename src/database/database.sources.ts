import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { configs } from '../config/config';
import { DatabaseName } from './database.types';

type DataSources = Record<DatabaseName, TypeOrmModuleOptions>;

export function getDataSources(): DataSources {
  let datasources: DataSources = {
    [DatabaseName.MONGO]: {
      type: 'mongodb',
      url: configs.DATABASE_MONGO_URL,
      synchronize: true,
      autoLoadEntities: true,
    },
    [DatabaseName.POSTGRES]: {
      type: 'postgres',
      url: configs.DATABASE_POSTGRES_URL,
      synchronize: true,
      autoLoadEntities: true,
      namingStrategy: new SnakeNamingStrategy(),
    },
  };

  if (process.env.JEST_WORKER_ID) {
    Object.keys(datasources).forEach((key) => {
      if ('url' in datasources[key]) {
        datasources[key].url = datasources[key].url.replace(
          'Test',
          `Test${process.env.JEST_WORKER_ID}`,
        );
      }
    });
  }

  return datasources;
}
