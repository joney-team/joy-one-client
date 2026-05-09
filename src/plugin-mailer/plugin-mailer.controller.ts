import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, Member } from '../app.decorators';
import { UserRole } from '../users/users.types';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { PluginMailerService } from './plugin-mailer.service';
import {
  SendMailInput,
  PluginMailerSendInternalWorkspace,
  PluginMailerSendUserDto,
  PluginMailerSendWorkspaceDto,
} from './plugin-mailer.types';

@Controller('plugins/mailer')
@ApiTags('Plugin Mailer')
export class PluginMailerController {
  constructor(private readonly service: PluginMailerService) {}

  @Post('/send')
  async send(@Body() dto: SendMailInput) {
    return this.service.triggerSend(dto);
  }

  @Post('/user/render')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async renderUserTemplate(@Body() dto: PluginMailerSendUserDto) {
    return this.service.renderUserTemplate(dto);
  }

  @Post('/user/send')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async sendUserWithTemplate(@Body() dto: PluginMailerSendUserDto) {
    return this.service.sendUserWithTemplate(dto);
  }

  @Post('/workspace/render')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async renderWorkspaceTemplate(
    @Body() dto: PluginMailerSendWorkspaceDto,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.renderWorkspaceTemplate({
      ...dto,
      workspace: member.workspaceId,
    });
  }

  @Post('/workspace/internal/send')
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async sendInternalWorkspace(
    @Body() dto: PluginMailerSendInternalWorkspace,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.sendInternalWorkspace({
      ...dto,
      workspace: member.workspaceId,
    });
  }
}
