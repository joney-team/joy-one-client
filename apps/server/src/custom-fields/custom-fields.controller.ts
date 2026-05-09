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
import { CustomFieldsService } from './custom-fields.service';
import { Auth, Member } from '../app.decorators';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { CustomFieldInput } from './custom-fields.types';

@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private readonly service: CustomFieldsService) {}

  @Get()
  @Auth({ member: true })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return this.service.list({ query, member });
  }

  @Get(':id')
  @Auth({ member: true })
  async get(@Member() member: WorkspaceMember, @Param('id') id: string) {
    return this.service.get({ member, id });
  }

  @Post()
  @Auth({ permission: WorkspacePermission.CUSTOM_FIELDS_MANAGER })
  async create(
    @Member() member: WorkspaceMember,
    @Body() input: CustomFieldInput,
  ) {
    return this.service.create({ member, input });
  }

  @Put(':id')
  @Auth({ permission: WorkspacePermission.CUSTOM_FIELDS_MANAGER })
  async update(
    @Member() member: WorkspaceMember,
    @Param('id') id: string,
    @Body() input: CustomFieldInput,
  ) {
    return this.service.update({ member, id, input });
  }

  @Delete(':id')
  @Auth({ permission: WorkspacePermission.CUSTOM_FIELDS_MANAGER })
  async delete(@Member() member: WorkspaceMember, @Param('id') id: string) {
    return this.service.delete({ member, id });
  }
}
