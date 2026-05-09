import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { getDataSources } from './database.sources';
import { DatabaseName } from './database.types';

const dataSources = getDataSources();

@Global()
@Module({
  imports: Object.values(DatabaseName).map((key) =>
    TypeOrmModule.forRoot({
      ...dataSources[key],
      name: key,
    }),
  ),
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
