import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { CustomFieldValue } from 'src/custom-fields/custom-fields.types';
import { WithWorkspaceArgs } from 'src/workspaces/workspaces.utils';
import { Auth, Member } from '../app.decorators';
import { bindData, listBindData } from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { CategoryInput, GenerateCategorySlugInput } from './categories.dtos';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly service: CategoriesService,
    private readonly customFields: CustomFieldsService,
  ) {}

  @Get()
  @Auth({ permission: WorkspacePermission.CATEGORIES_VIEW })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return listBindData({
      list: async () => {
        const { results, total } = await this.service.list({ query, member });
        return { data: results, count: total };
      },
      bindData: (data) => this.bindData({ entity: data, member }),
    });
  }

  async bindData(args: WithWorkspaceArgs<{ entity: CategoryEntity }>) {
    return bindData<
      {
        customFields?: CustomFieldValue[];
      },
      CategoryEntity
    >({
      entity: args.entity,
      extends: {
        customFields: async (data) =>
          this.customFields.bindCustomFieldValues(data),
      },
    });
  }

  @Get('/slug/:slug')
  @Auth({ permission: WorkspacePermission.CATEGORIES_VIEW })
  async getBySlug(
    @Member() member: WorkspaceMember,
    @Param('slug') slug: string,
  ) {
    return this.service
      .getBySlug({ member, slug })
      .then((data) => this.bindData({ entity: data, member }));
  }

  @Get('/ids')
  @Auth({ permission: WorkspacePermission.CATEGORIES_VIEW })
  async getByIds(
    @Member() member: WorkspaceMember,
    @Query('ids') ids: string[],
  ) {
    return this.service
      .getByIds({ member, ids })
      .then((data) =>
        Promise.all(
          data.map((item) => this.bindData({ entity: item, member })),
        ),
      );
  }

  @Get('/:id')
  @Auth({ permission: WorkspacePermission.CATEGORIES_VIEW })
  async get(@Member() member: WorkspaceMember, @Param('id') id: string) {
    return this.service
      .get({ member, id })
      .then((data) => this.bindData({ entity: data, member }));
  }

  @Post()
  @Auth({ permission: WorkspacePermission.CATEGORIES_MANAGER })
  async create(
    @Member() member: WorkspaceMember,
    @Body() input: CategoryInput,
  ) {
    return this.service
      .create({ member, input })
      .then((data) => this.bindData({ entity: data, member }));
  }

  @Put('/:id')
  @Auth({ permission: WorkspacePermission.CATEGORIES_MANAGER })
  async update(
    @Member() member: WorkspaceMember,
    @Param('id') id: string,
    @Body() input: CategoryInput,
  ) {
    return this.service
      .update({ member, id, input })
      .then((data) => this.bindData({ entity: data, member }));
  }

  @Delete('/:id')
  @Auth({ permission: WorkspacePermission.CATEGORIES_MANAGER })
  async delete(@Member() member: WorkspaceMember, @Param('id') id: string) {
    return this.service.delete({ member, id });
  }

  @Post('/slug')
  @Auth({ permission: WorkspacePermission.CATEGORIES_MANAGER })
  async generateSlug(
    @Member() member: WorkspaceMember,
    @Body() dto: GenerateCategorySlugInput,
  ) {
    return this.service.generateSlug(member, dto).then((slug) => ({ slug }));
  }

  @Patch('/:id/interact')
  @Auth({ member: true })
  async interact(@Member() member: WorkspaceMember, @Param('id') id: string) {
    return this.service.interact({ member, id });
  }
}
