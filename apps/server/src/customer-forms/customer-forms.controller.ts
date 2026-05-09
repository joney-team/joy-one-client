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
import { Auth, Member } from '../app.decorators';
import {
  BulkUpdateWorkspaceBranchInput,
  listBindData,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { BulkArchiveInput, CustomerFormInput } from './customer-forms.dtos';
import { CustomerFormsService } from './customer-forms.service';

@Controller('customer-forms')
export class CustomerFormsController {
  constructor(private readonly service: CustomerFormsService) {}

  @Post()
  async create(@Body() body: CustomerFormInput) {
    return this.service.create(body).then((res) => this.service.bindData(res));
  }

  @Get()
  @Auth({ permission: WorkspacePermission.CUSTOMER_FORMS_MANAGER })
  async list(@Query() query: any, @Member() member: WorkspaceMember) {
    return listBindData({
      list: () => this.service.list({ query, member }),
      bindData: (data) => this.service.bindData(data),
    });
  }

  @Get(':id')
  @Auth({ permission: WorkspacePermission.CUSTOMER_FORMS_MANAGER })
  async get(@Param('id') id: string, @Member() member: WorkspaceMember) {
    return this.service
      .get({ id, member })
      .then((res) => this.service.bindData(res));
  }

  @Post('/bulk-update-workspace-branch')
  @Auth({ permission: WorkspacePermission.CUSTOMER_FORMS_MANAGER })
  async bulkUpdateWorkspaceBranch(
    @Body() body: BulkUpdateWorkspaceBranchInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.bulkUpdateWorkspaceBranch({ member, input: body });
  }

  @Put(':id')
  @Auth({ permission: WorkspacePermission.CUSTOMER_FORMS_MANAGER })
  async update(
    @Param('id') id: string,
    @Body() body: CustomerFormInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service
      .update({ member, id, input: body })
      .then((res) => this.service.bindData(res));
  }

  @Delete()
  @Auth({ permission: WorkspacePermission.CUSTOMER_FORMS_MANAGER })
  async multiArchive(
    @Member() member: WorkspaceMember,
    @Body() body: BulkArchiveInput,
  ) {
    return this.service.bulkArchive({ member, ids: body.ids });
  }

  @Delete(':id')
  @Auth({ permission: WorkspacePermission.CUSTOMER_FORMS_MANAGER })
  async delete(@Param('id') id: string, @Member() member: WorkspaceMember) {
    return this.service.archive({ id, member });
  }
}
