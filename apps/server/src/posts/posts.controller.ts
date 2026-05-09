import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from 'src/categories/categories.service';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { CustomFieldValue } from 'src/custom-fields/custom-fields.types';
import { Auth, Member } from '../app.decorators';
import { bindData, listBindData } from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { PostEntity } from './entities/post.entity';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly service: PostsService,
    private readonly categories: CategoriesService,
    private readonly customFields: CustomFieldsService,
  ) {}

  async bindData(member: WorkspaceMember, entity: PostEntity) {
    return bindData<
      {
        category?: CategoryEntity | undefined;
        customFields?: CustomFieldValue[];
      },
      PostEntity
    >({
      entity,
      extends: {
        category: async (data) => {
          if (!data.categoryId) return undefined;
          return this.categories
            .get({ member, id: data.categoryId })
            .catch(() => undefined);
        },
        customFields: async (data) => {
          return this.customFields.bindCustomFieldValues(data);
        },
      },
    });
  }

  @Get()
  @Auth({ permission: WorkspacePermission.POSTS_VIEW })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return listBindData({
      list: async () => {
        const { results, total } = await this.service.list({ query, member });
        return { data: results, count: total };
      },
      bindData: (data) => this.bindData(member, data),
    });
  }

  @Get('ids')
  @Auth({ permission: WorkspacePermission.POSTS_VIEW })
  async getByIds(@Query() query: any) {
    const ids = query.ids ? (`${query.ids}`.split(',') as string[]) : [];
    return this.service.getByIds(ids);
  }

  @Get('/public/:id')
  async getPublic(@Param('id') id: string) {
    return this.service.get({ id });
  }

  @Get('/:id')
  @Auth({ permission: WorkspacePermission.POSTS_VIEW })
  async get(@Member() member: WorkspaceMember, @Param('id') id: string) {
    return this.service
      .get({ member, id })
      .then((data) => this.bindData(member, data));
  }
}
