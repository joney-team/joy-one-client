import { Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { MessageBoxesModule } from '../message-boxes/message-boxes.module';
import { PluginAiAssistantEntity } from './entities/plugin-ai-assistant.entity';
import { PluginAiAssistantsResolver } from './plugin-ai-assistants.resolver';
import { PluginAiAssistantsService } from './plugin-ai-assistants.service';

@Module({
  providers: [PluginAiAssistantsService, PluginAiAssistantsResolver],
  imports: [MongoEntities(PluginAiAssistantEntity), MessageBoxesModule],
  exports: [PluginAiAssistantsService],
})
export class PluginAiAssistantsModule {}
