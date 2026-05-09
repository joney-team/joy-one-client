import { Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { PluginExternalStorageEntity } from './entities/plugin-external-storage.entity';
import { PluginExternalStorageResolver } from './plugin-external-storage.resolver';
import { PluginExternalStorageService } from './plugin-external-storage.service';

@Module({
  providers: [PluginExternalStorageResolver, PluginExternalStorageService],
  imports: [MongoEntities(PluginExternalStorageEntity)],
  exports: [PluginExternalStorageService],
})
export class PluginExternalStorageModule {}
