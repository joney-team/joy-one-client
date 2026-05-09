import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from 'src/categories/categories.service';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { Auth, Member } from '../app.decorators';
import {
  bindData,
  listBindData,
  safeBindData,
} from '../database/database.utils';
import { ProductEntity } from './entities/product.entity';
import { ProductsService } from './products.service';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(
    private readonly service: ProductsService,
    private readonly categories: CategoriesService,
    private readonly customFields: CustomFieldsService,
  ) {}

  @Get()
  @Auth({ member: true })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return listBindData({
      list: async () => {
        const { results, total } = await this.service.list({ query, member });
        return { data: results, count: total };
      },
      bindData: (product) => this.bindData(product, member),
    });
  }

  @Get('ids')
  @Auth({ member: true })
  async getByIds(@Query() query: any, @Member() member: WorkspaceMember) {
    const ids = query.ids ? (`${query.ids}`.split(',') as string[]) : [];
    return Promise.all(ids.map((id) => this.service.get({ id, member })));
  }

  @Get('/:id')
  @Auth({ member: true })
  async get(@Param('id') id: string, @Member() member: WorkspaceMember) {
    return this.service
      .get({ id, member })
      .then((data) => this.bindData(data, member));
  }

  async bindData(entity: ProductEntity, member: WorkspaceMember) {
    return bindData<any, ProductEntity>({
      entity,
      extends: {
        category: safeBindData({
          entity,
          field: 'categoryId',
          fetch: (id) => this.categories.get({ member, id }).catch(() => null),
        }),
        customFields: async (data) =>
          this.customFields.bindCustomFieldValues(data),
      },
    });
  }
}
