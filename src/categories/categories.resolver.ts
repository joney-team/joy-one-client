import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CustomFieldValue } from 'src/custom-fields/custom-fields.types';
import { Auth, Member } from '../app.decorators';
import { CustomFieldsService } from '../custom-fields/custom-fields.service';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { CategoryInput, GenerateCategorySlugInput } from './categories.dtos';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity';

@ObjectType()
export class CategoriesPaginated extends PaginatedResponse(CategoryEntity) {}

@Resolver(() => CategoryEntity)
export class CategoriesResolver {
  constructor(
    private readonly service: CategoriesService,
    private readonly customFields: CustomFieldsService,
  ) {}

  @Mutation(() => String)
  @Auth({ permission: WorkspacePermission.CATEGORIES_MANAGER })
  async generateCategorySlug(
    @Member() member: WorkspaceMember,
    @Args('input') input: GenerateCategorySlugInput,
  ) {
    return this.service.generateSlug(member, input);
  }

  @Query(() => CategoryEntity)
  @Auth({ permission: WorkspacePermission.CATEGORIES_VIEW })
  async getCategoryBySlug(
    @Member() member: WorkspaceMember,
    @Args('slug') slug: string,
  ) {
    return this.service.getBySlug({ member, slug });
  }

  @Query(() => [CategoryEntity])
  @Auth({ permission: WorkspacePermission.CATEGORIES_VIEW })
  async getCategoriesByIds(
    @Member() member: WorkspaceMember,
    @Args('ids', { type: () => [String] }) ids: string[],
  ) {
    return this.service.getByIds({ member, ids });
  }

  @Query(() => CategoryEntity)
  @Auth({ permission: WorkspacePermission.CATEGORIES_VIEW })
  async getCategoryById(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.get({ member, id });
  }

  @Query(() => CategoriesPaginated)
  @Auth({ permission: WorkspacePermission.CATEGORIES_VIEW })
  async getCategories(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({
      member,
      query: normalizeQuery(args),
    });
  }

  @Mutation(() => CategoryEntity)
  @Auth({ permission: WorkspacePermission.CATEGORIES_MANAGER })
  async createCategory(
    @Member() member: WorkspaceMember,
    @Args('input') input: CategoryInput,
  ) {
    return this.service.create({ member, input });
  }

  @Mutation(() => CategoryEntity)
  @Auth({ permission: WorkspacePermission.CATEGORIES_MANAGER })
  async updateCategory(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: CategoryInput,
  ) {
    return this.service.update({ member, id, input });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.CATEGORIES_MANAGER })
  async deleteCategory(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    await this.service.delete({ member, id });
    return true;
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async interactCategory(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    await this.service.interact({ member, id });
    return true;
  }

  @ResolveField(() => [CustomFieldValue], { name: 'customFieldValues' })
  async resolveCustomFields(@Parent() category: CategoryEntity) {
    return this.customFields.bindCustomFieldValues(category);
  }
}
