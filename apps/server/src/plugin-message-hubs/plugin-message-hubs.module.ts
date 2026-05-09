import { forwardRef, Module } from '@nestjs/common';
import { MessageBoxesModule } from '../message-boxes/message-boxes.module';
import { PluginMessageHubsController } from './plugin-message-hubs.controller';
import { PluginMessageHubsService } from './plugin-message-hubs.service';
import { PluginMessageHubsResolver } from './plugin-message-hubs.resolver';

@Module({
  controllers: [PluginMessageHubsController],
  providers: [PluginMessageHubsService, PluginMessageHubsResolver],
  imports: [
    forwardRef(() => MessageBoxesModule),
  ],
  exports: [PluginMessageHubsService],
})
export class PluginMessageHubsModule {}
