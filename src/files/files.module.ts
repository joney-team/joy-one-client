import { Global, Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { PluginExternalStorageModule } from '../plugin-external-storage/plugin-external-storage.module';
import { FilesController } from './files.controller';
import { FileEntity } from './files.entity';
import { FilesResolver } from './files.resolver';
import { FilesService } from './files.service';

@Global()
@Module({
  controllers: [FilesController],
  providers: [FilesService, FilesResolver],
  exports: [FilesService],
  imports: [MongoEntities(FileEntity), PluginExternalStorageModule],
})
export class FilesModule {}
