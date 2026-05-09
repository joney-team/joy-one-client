import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, Workspace } from '../app.decorators';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { WorkspaceSettingsService } from './workspace-settings.service';

@Controller('workspace-settings')
@ApiTags('Workspace Settings')
export class WorkspaceSettingsController {
  constructor(private service: WorkspaceSettingsService) {}

  @Get()
  @Auth({ member: true })
  async get(@Workspace() ws: WorkspaceEntity) {
    return this.service.get(ws._id);
  }

  @Get('/domains/:domain')
  async getByAppDomain(@Param('domain') domain: string) {
    return this.service.getByAppDomain(domain);
  }
}
