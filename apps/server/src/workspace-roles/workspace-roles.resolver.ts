import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceRole } from './entities/workspace-role.entity';
import { WorkspaceRolesService } from './workspace-roles.service';
import {
  WorkspaceRoleInput,
  WorkspacePermission,
} from './workspace-roles.types';

@Resolver(() => WorkspaceRole)
export class WorkspaceRolesResolver {
  constructor(private readonly service: WorkspaceRolesService) {}

  @Query(() => [WorkspaceRole])
  @Auth({ member: true })
  async getWorkspaceRoles(@Member() member: WorkspaceMember) {
    return this.service.getWorkspaceRoles({ member });
  }

  @Mutation(() => WorkspaceRole)
  @Auth({ permission: WorkspacePermission.WORKSPACE_ROLES_MANAGER })
  async createWorkspaceRole(
    @Member() member: WorkspaceMember,
    @Args('input') input: WorkspaceRoleInput,
  ) {
    return this.service.create({ input, member });
  }

  @Mutation(() => WorkspaceRole)
  @Auth({ permission: WorkspacePermission.WORKSPACE_ROLES_MANAGER })
  async updateWorkspaceRole(
    @Member() member: WorkspaceMember,
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: WorkspaceRoleInput,
  ) {
    return this.service.update({ id, input, member });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_ROLES_MANAGER })
  async deleteWorkspaceRole(
    @Member() member: WorkspaceMember,
    @Args('id', { type: () => String }) id: string,
  ) {
    return this.service.remove({ id, member });
  }
}
