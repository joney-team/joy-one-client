import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { Reaction, ReactionEntity } from './entities/reaction.entity';
import { ReactionsService } from './reactions.service';
import {
  AddReactionArgs,
  ReactionsCount,
  GetEntityReactionsArgs,
  ReactionsPaginatedArgs,
  RemoveReactionArgs,
} from './reactions.types';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { PaginatedResponse } from '../database/database.utils';

@ObjectType()
export class ReactionsPaginated extends PaginatedResponse(Reaction) {}

@Resolver(() => Reaction)
export class ReactionsResolver {
  constructor(
    private readonly service: ReactionsService,
    private readonly workspaceMembers: WorkspaceMembersService,
  ) {}

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async addReaction(
    @Member() member: WorkspaceMember,
    @Args() args: AddReactionArgs,
  ) {
    return this.service.add({ member, ...args });
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async removeReaction(
    @Member() member: WorkspaceMember,
    @Args() args: RemoveReactionArgs,
  ) {
    return this.service.remove({ member, ...args });
  }

  @Query(() => ReactionsCount)
  @Auth({ member: true })
  async reactionsCount(
    @Member() member: WorkspaceMember,
    @Args() args: GetEntityReactionsArgs,
  ) {
    return this.service.count({ member, ...args });
  }

  @Query(() => ReactionsPaginated)
  @Auth({ member: true })
  async reactions(
    @Member() member: WorkspaceMember,
    @Args() args: ReactionsPaginatedArgs,
  ) {
    const { count, data } = await this.service.list({ member, ...args });

    return {
      total: count,
      results: data,
    };
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, { name: 'user' })
  async resolveUser(@Parent() reaction: ReactionEntity) {
    if (!reaction.userId) return null;
    return this.workspaceMembers.getMemberInfo({
      userId: reaction.userId,
      workspaceId: reaction.workspaceId,
    });
  }
}
