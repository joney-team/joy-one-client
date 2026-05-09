import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CategoriesService } from 'src/categories/categories.service';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { CustomFieldValue } from 'src/custom-fields/custom-fields.types';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { Auth, Member } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { PostEntity } from './entities/post.entity';
import { GenerateSlugInput, PostInput } from './posts.inputs';
import { PostsService } from './posts.service';

@ObjectType()
export class PostsPaginated extends PaginatedResponse(PostEntity) {}

@Resolver(() => PostEntity)
export class PostsResolver {
  constructor(
    private readonly service: PostsService,
    private readonly categories: CategoriesService,
    private readonly customFields: CustomFieldsService,
  ) {}

  @Query(() => PostEntity)
  @Auth({ member: true })
  async getPostById(@Args('id') id: string, @Member() member: WorkspaceMember) {
    return this.service.get({ id, member });
  }

  @Query(() => String)
  @Auth({ permission: WorkspacePermission.POSTS_MANAGER })
  async generatePostSlug(
    @Member() member: WorkspaceMember,
    @Args('input') input: GenerateSlugInput,
  ) {
    return this.service.generateSlug(member, input);
  }

  @Query(() => PostsPaginated)
  @Auth({ member: true })
  async getPosts(
    @Args() args: DynamicPaginatedArgs,
    @Member() member: WorkspaceMember,
  ) {
    const { results: data, total: count } = await this.service.list({
      member,
      query: normalizeQuery(args),
    });
    return {
      results: data,
      total: count,
    };
  }

  @Mutation(() => PostEntity)
  @Auth({ permission: WorkspacePermission.POSTS_MANAGER })
  async createPost(
    @Member() member: WorkspaceMember,
    @Args('input') input: PostInput,
  ) {
    return this.service.create({ member, input });
  }

  @Mutation(() => PostEntity)
  @Auth({ permission: WorkspacePermission.POSTS_MANAGER })
  async updatePost(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: PostInput,
  ) {
    return this.service.update({ member, id, input });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.POSTS_MANAGER })
  async bulkArchivePosts(
    @Member() member: WorkspaceMember,
    @Args('ids', { type: () => [String] }) ids: string[],
  ) {
    await this.service.bulkArchive({ member, ids });
    return true;
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.POSTS_MANAGER })
  async archivePost(@Member() member: WorkspaceMember, @Args('id') id: string) {
    await this.service.archive({ member, id });
    return true;
  }

  @ResolveField(() => [CustomFieldValue], { name: 'customFieldValues' })
  async resolveCustomFields(@Parent() post: PostEntity) {
    return this.customFields.bindCustomFieldValues(post);
  }

  @ResolveField(() => CategoryEntity, { name: 'category', nullable: true })
  async resolveCategory(@Parent() post: PostEntity) {
    if (!post.categoryId) return null;

    return this.categories.get({
      workspaceId: post.workspaceId,
      id: post.categoryId,
      allowNotFound: true,
    });
  }
}
