import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Auth, Workspace } from '../app.decorators';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { PluginMessageHubsService } from './plugin-message-hubs.service';
import { PluginMessageHubInput } from './plugin-message-hubs.types';
import { pluginMessageHubsRequest } from './plugin-message-hubs.request';

@Controller('plugins/message-hubs')
export class PluginMessageHubsController {
  constructor(private readonly service: PluginMessageHubsService) {}

  // @Get('/ping')
  // async ping() {
  //   return pluginMessageHubsRequest.get(`/`);
  // }

  // @Get()
  // @Auth({ requireMember: true })
  // async list(@Workspace() ws: WorkspaceEntity, @Query() query: any) {
  //   return this.service.list({
  //     ...query,
  //     ref: ws._id.toString(),
  //   });
  // }

  // @Post()
  // @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  // async create(
  //   @Body() dto: PluginMessageHubInput,
  //   @Workspace() ws: WorkspaceEntity,
  // ) {
  //   return this.service.create(ws, dto);
  // }

  // @Post('webhook')
  // async webhook(@Body() payload: any) {
  //   return this.service.webhook(payload);
  // }

  // @Put(':id')
  // @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  // async update(
  //   @Body() dto: PluginMessageHubInput,
  //   @Workspace() ws: WorkspaceEntity,
  //   @Param('id') id: string,
  // ) {
  //   return this.service.update(ws, id, dto);
  // }

  // @Delete(':id')
  // @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  // async remove(@Workspace() ws: WorkspaceEntity, @Param('id') id: string) {
  //   return this.service.remove(ws, id);
  // }
}
