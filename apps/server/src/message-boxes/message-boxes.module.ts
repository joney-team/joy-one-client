import { Module, forwardRef } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { MongoEntities } from '../database/database.utils';
import { PluginMessageHubsModule } from '../plugin-message-hubs/plugin-message-hubs.module';
import { PluginMetaPagesModule } from '../plugin-meta-pages/plugin-meta-pages.module';
import { PluginZaloOAsModule } from '../plugin-zalo-oas/plugin-zalo-oas.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { MessageBoxEntity } from './entities/message-box.entity';
import { MessageEntity } from './entities/message.entity';
import { MessageBoxesResolver } from './message-boxes.resolver';
import { MessageBoxesService } from './message-boxes.service';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';

@Module({
  providers: [
    MessageBoxesService,
    MessageBoxesResolver,
    MessagesService,
    MessagesResolver,
  ],
  imports: [
    MongoEntities(MessageBoxEntity, MessageEntity),
    forwardRef(() => PluginMetaPagesModule),
    forwardRef(() => PluginZaloOAsModule),
    forwardRef(() => PluginMessageHubsModule),
    forwardRef(() => PluginZaloOAsModule),
    forwardRef(() => WorkspaceMembersModule),
    forwardRef(() => CustomersModule),
  ],
  exports: [MessageBoxesService, MessagesService],
})
export class MessageBoxesModule {}
