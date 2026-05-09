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
import {
  Auth,
  Member,
  RequireWorkspaceApp,
  WorkspaceApp,
} from '../app.decorators';
import { listBindData } from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspaceApiAppInput } from './workspace-api-apps.dtos';
import { WorkspaceApiAppEntity } from './entities/workspace-api-app.entity';
import { WorkspaceApiAppsService } from './workspace-api-apps.service';

@Controller('workspace-api-apps')
export class WorkspaceApiAppsController {
  constructor(private readonly service: WorkspaceApiAppsService) {}

  @Get()
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async list(@Query() query: any, @Member() member: WorkspaceMember) {
    return listBindData({
      list: () => this.service.list({ query, member }),
      bindData: (app) => this.service.bindData(app),
    });
  }

  @Get('/info')
  @RequireWorkspaceApp()
  async info(@WorkspaceApp() app: WorkspaceApiAppEntity) {
    return app;
  }

  @Post()
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async create(
    @Body() dto: WorkspaceApiAppInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service
      .create(member, dto)
      .then((res) => this.service.bindData(res));
  }

  @Put(':id')
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async update(
    @Param('id') id: string,
    @Body() dto: WorkspaceApiAppInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service
      .update({ id, member, dto })
      .then((res) => this.service.bindData(res));
  }

  @Post(':id/reset-secret-key')
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async resetSecretKey(
    @Param('id') id: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service
      .resetSecretKey({ id, member })
      .then((res) => this.service.bindData(res));
  }

  @Delete(':id')
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async archive(@Param('id') id: string, @Member() member: WorkspaceMember) {
    return this.service.archive({ id, member });
  }
}
