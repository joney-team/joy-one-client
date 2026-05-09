import { forwardRef, Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { MessageBoxesModule } from '../message-boxes/message-boxes.module';
import { PluginZaloOAsController } from './plugin-zalo-oas.controller';
import { PluginZaloOaEntity } from './entities/plugin-zalo-oa.entity';
import { PluginZaloOasService } from './plugin-zalo-oas.service';
import { WorkspaceSettingsModule } from '../workspace-settings/workspace-settings.module';
import { FilesModule } from '../files/files.module';
import { PluginZaloOasResolver } from './plugin-zalo-oas.resolver';

@Module({
  controllers: [PluginZaloOAsController],
  providers: [PluginZaloOasService, PluginZaloOasResolver],
  imports: [
    MongoEntities(PluginZaloOaEntity),
    forwardRef(() => MessageBoxesModule),
    WorkspaceSettingsModule,
    FilesModule,
  ],
  exports: [PluginZaloOasService],
})
export class PluginZaloOAsModule {}
