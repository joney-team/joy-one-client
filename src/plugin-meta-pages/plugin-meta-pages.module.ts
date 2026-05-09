import { Module, forwardRef } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { MessageBoxesModule } from '../message-boxes/message-boxes.module';
import { PluginMetaPagesController } from './plugin-meta-pages.controller';
import { PluginMetaPageEntity } from './plugin-meta-pages.entity';
import { PluginMetaPagesService } from './plugin-meta-pages.service';
import { PluginMetaPagesResolver } from './plugin-meta-pages.resolver';

@Module({
  providers: [PluginMetaPagesService, PluginMetaPagesResolver],
  controllers: [PluginMetaPagesController],
  imports: [
    MongoEntities(PluginMetaPageEntity),
    forwardRef(() => MessageBoxesModule),
  ],
  exports: [PluginMetaPagesService],
})
export class PluginMetaPagesModule { }
