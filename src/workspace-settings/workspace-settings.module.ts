import { Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { WorkspaceSettingsController } from './workspace-settings.controller';
import { WorkspaceSettingEntity } from './entities/workspace-setting.entity';
import { WorkspaceSettingsService } from './workspace-settings.service';
import { WorkspaceSettingsResolver } from './workspace-settings.resolver';

@Module({
  controllers: [WorkspaceSettingsController],
  providers: [WorkspaceSettingsService, WorkspaceSettingsResolver],
  imports: [MongoEntities(WorkspaceSettingEntity)],
  exports: [WorkspaceSettingsService],
})
export class WorkspaceSettingsModule {}
