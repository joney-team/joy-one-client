import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, Member } from './app.decorators';
import { logger } from './app.logger';
import { AppService } from './app.service';
import { AppDebug, AppMetadata } from './app.types';
import { configs } from './config/config';
import { WorkspaceMember } from './workspace-members/entities/workspace-member.entity';
import { WorkspaceSettingsService } from './workspace-settings/workspace-settings.service';
import { WorkspaceEntity } from './workspaces/entities/workspace.entity';
import { WorkspacesService } from './workspaces/workspaces.service';

@Controller()
@ApiTags('App')
export class AppController {
  constructor(
    private readonly service: AppService,
    private readonly workspaceSettings: WorkspaceSettingsService,
    private readonly workspaces: WorkspacesService,
  ) {}

  @Get()
  app() {
    return {
      message: `Welcome to ${configs.APP_NAME} v${configs.APP_VERSION}`,
    };
  }

  getWorkspaceAppMetadata(workspace?: WorkspaceEntity) {
    let metadata: AppMetadata = {
      title: 'JoyOne',
      webURL: configs.APP_URL,
      thumbnailURL: `${configs.PUBLIC_URL}/thumbnail.png`,
      description: 'Enjoy Work In One App',
      siteName: 'Joy One App',
      type: 'website',
      favicon: '/favicon.ico',
      appColor: 'primary',
      appIcon: '/favicon.ico',
      appName: 'JoyOne',
      isExtended: false,
    };

    if (workspace) {
      metadata.isExtended = true;
      metadata.appColor = workspace.appColor;
      metadata.appIcon = workspace.appIcon;
      metadata.thumbnailURL = workspace.cover;
      metadata.title = workspace.name;
      metadata.siteName = workspace.name;
      metadata.favicon = workspace.appIcon;
      metadata.appName = workspace.appName || workspace.name;
    }

    return metadata;
  }

  @Get('/metadata/workspaces/codes/:code')
  async workspaceCode(@Param('code') code: string) {
    const workspace = await this.workspaces.getByCode(code).catch(() => null);
    return this.getWorkspaceAppMetadata(workspace);
  }

  @Get('/metadata/:host')
  async metadata(@Param('host') host: string) {
    const workspace: WorkspaceEntity | null = await this.workspaces
      .getByDomain(host)
      .catch(() => null);
    return this.getWorkspaceAppMetadata(workspace);
  }

  @Get('/stat')
  ping() {
    return this.service.config();
  }

  @Get('/config')
  config() {
    return this.service.config();
  }

  @Get('/workspace-initialize')
  @Auth({ member: true })
  async workspaceInit(@Member() member: WorkspaceMember) {
    const [settings] = await Promise.all([
      this.workspaceSettings.get(member.workspaceId),
    ]);

    return {
      settings,
    };
  }

  @Get('/debug-logger')
  getError() {
    logger.info('Logger test INFO', {
      alert: true,
      fields: {
        name: 'John Doe',
        age: 20,
        email: 'john.doe@example.com',
      },
    });
    logger.error(new Error('Test error message'));
  }

  @Post('/debug')
  setDebug(@Body() body: AppDebug) {
    this.service.setDebug(body);
  }
}
