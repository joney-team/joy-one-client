import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Auth, Member } from '../app.decorators';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceBranchesService } from './workspace-branches.service';
import { WorkspaceBranchInput } from './workspace-branches.types';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';

@Controller('workspace-branches')
export class WorkspaceBranchesController {
  constructor(private readonly service: WorkspaceBranchesService) {}

  @Get()
  @Auth({ member: true })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return this.service.list({ member, query });
  }

  @Get('/ids/:id')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Get('/ids')
  @Auth({ member: true })
  async getByIds(@Query('ids') ids: string[]) {
    return this.service.getByIds(ids);
  }

  @Post()
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async create(
    @Member() member: WorkspaceMember,
    @Body() input: WorkspaceBranchInput,
  ) {
    return this.service.create({ member, input });
  }

  @Put('/:id')
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async update(
    @Member() member: WorkspaceMember,
    @Param('id') id: string,
    @Body() input: WorkspaceBranchInput,
  ) {
    return this.service.update({ member, id, input });
  }
}
