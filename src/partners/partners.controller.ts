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
import { ApiTags } from '@nestjs/swagger';
import { Auth, Member, Workspace } from '../app.decorators';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { PartnersService } from './partners.service';
import { PartnerInput } from './partners.types';

@Controller('partners')
@ApiTags('Partners')
export class PartnersController {
  constructor(private readonly service: PartnersService) {}

  @Get()
  @Auth({ member: true })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return this.service.list({ query, member });
  }

  // @Post()
  // @Auth({
  //   requireMember: true,
  //   permission: WorkspacePermission.PARTNERS_WRITE,
  // })
  // async create(
  //   @Member() member: WorkspaceMember,
  //   @Workspace() workspace: WorkspaceEntity,
  //   @Body() dto: PartnerInput,
  // ) {
  //   return this.service.create(member, workspace, dto);
  // }

  // @Get('/:id')
  // @Auth()
  // async getWithCache(@Param('id') id: string) {
  //   return this.service.getWithCache(id);
  // }

  // @Put('/:id')
  // @Auth({
  //   requireMember: true,
  //   permission: WorkspacePermission.PARTNERS_WRITE,
  // })
  // async update(
  //   @Member() member: WorkspaceMember,
  //   @Workspace() workspace: WorkspaceEntity,
  //   @Body() dto: PartnerInput,
  //   @Param('id') id: string,
  // ) {
  //   return this.service.update(member, workspace, id, dto);
  // }

  // @Delete('/:id/archive')
  // @Auth({
  //   requireMember: true,
  //   permission: WorkspacePermission.PARTNERS_WRITE,
  // })
  // async archive(
  //   @Member() member: WorkspaceMember,
  //   @Workspace() workspace: WorkspaceEntity,
  //   @Param('id') id: string,
  // ) {
  //   return this.service.archive(member, id, workspace);
  // }
}
