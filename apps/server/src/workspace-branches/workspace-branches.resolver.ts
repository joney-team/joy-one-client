import { Args, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspaceBranchEntity } from './entities/workspace-branch.entity';
import { WorkspaceBranchesService } from './workspace-branches.service';
import { WorkspaceBranchInput } from './workspace-branches.types';

@ObjectType()
export class WorkspaceBranchesPaginated extends PaginatedResponse(
  WorkspaceBranchEntity,
) {}

@Resolver(() => WorkspaceBranchEntity)
export class WorkspaceBranchesResolver {
  constructor(private readonly service: WorkspaceBranchesService) {}

  @Query(() => WorkspaceBranchesPaginated)
  @Auth({ member: true })
  async getWorkspaceBranches(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    const { count, data } = await this.service.list({
      member,
      query: normalizeQuery(args),
    });

    return {
      total: count,
      results: data,
    };
  }

  @Query(() => WorkspaceBranchEntity)
  async getWorkspaceBranchById(@Args('id') id: string) {
    return this.service.getById(id);
  }

  @Query(() => [WorkspaceBranchEntity])
  async getWorkspaceBranchesByIds(
    @Args('ids', { type: () => [String] }) ids: string[],
  ) {
    return this.service.getByIds(ids);
  }

  @Mutation(() => WorkspaceBranchEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async createWorkspaceBranch(
    @Member() member: WorkspaceMember,
    @Args('input') input: WorkspaceBranchInput,
  ) {
    return this.service.create({ member, input });
  }

  @Mutation(() => WorkspaceBranchEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async updateWorkspaceBranch(
    @Member() member: WorkspaceMember,
    @Args('input') input: WorkspaceBranchInput,
    @Args('id') id: string,
  ) {
    return this.service.update({ member, input, id });
  }
}
