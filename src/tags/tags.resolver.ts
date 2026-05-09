import {
  Args,
  ArgsType,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import {
  normalizeQuery,
  PaginatedArgs,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { TagEntity } from './entities/tag.entity';
import { TagsService } from './tags.service';
import { BulkUpdateTagsArgs, TagInput, TagType } from './tags.types';

@ObjectType()
export class TagsPaginated extends PaginatedResponse(TagEntity) {}

@InputType()
export class GetTagsQuery {
  @Field(() => TagType, { nullable: true })
  type?: TagType;
}

@ArgsType()
export class GetTagsArgs extends PaginatedArgs(GetTagsQuery) {}

@Resolver(() => TagEntity)
export class TagsResolver {
  constructor(private readonly service: TagsService) {}

  @Query(() => TagEntity)
  async getTagBySlug(@Args('slug', { type: () => String }) slug: string) {
    return this.service.getBySlug(slug);
  }

  @Query(() => TagsPaginated)
  @Auth({ member: true })
  async getTags(@Member() member: WorkspaceMember, @Args() args: GetTagsArgs) {
    return this.service.list({
      member,
      query: { ...normalizeQuery(args), all: true },
    });
  }

  @Mutation(() => TagEntity)
  @Auth({ member: true })
  async createTag(
    @Member() member: WorkspaceMember,
    @Args('input') input: TagInput,
  ) {
    return this.service.create({ member, input });
  }

  @Mutation(() => [TagEntity])
  @Auth({ member: true })
  async bulkUpdateTags(
    @Member() member: WorkspaceMember,
    @Args() args: BulkUpdateTagsArgs,
  ) {
    return this.service.bulkUpdate({ member, ...args });
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async removeTag(
    @Member() member: WorkspaceMember,
    @Args('id', { type: () => String }) id: string,
  ) {
    await this.service.remove({ member, _id: id });
    return true;
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async interactTag(
    @Member() member: WorkspaceMember,
    @Args('id', { type: () => String }) id: string,
  ) {
    await this.service.interact({ member, _id: id });
    return true;
  }
}
