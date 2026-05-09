import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserEntity } from 'src/users/entities/user.entity';
import { Auth, Member, User } from '../app.decorators';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspaceEntity } from './entities/workspace.entity';
import { WorkspacesService } from './workspaces.service';
import {
  CreateWorkspaceInput,
  WorkspaceInput,
  WorkspaceInviteInformation,
} from './workspaces.types';

@Resolver(() => WorkspaceEntity)
export class WorkspacesResolver {
  constructor(private readonly service: WorkspacesService) {}

  @Mutation(() => WorkspaceEntity)
  @Auth()
  async createWorkspace(
    @User() user: UserEntity,
    @Args('input') input: CreateWorkspaceInput,
  ) {
    return this.service.create(user, input);
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async archiveWorkspace(@Member() member: WorkspaceMember) {
    return this.service.archive(member);
  }

  @Query(() => WorkspaceEntity)
  async getWorkspaceById(@Args('id') id: string) {
    return this.service.get(id);
  }

  @Query(() => WorkspaceEntity)
  @Auth({ member: true })
  async workspace(@Member() member: WorkspaceMember) {
    return member.workspace;
  }

  @Mutation(() => WorkspaceEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async updateWorkspace(
    @Member() member: WorkspaceMember,
    @Args('input') input: WorkspaceInput,
  ) {
    return this.service.update({ member, input });
  }

  @Mutation(() => String)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async generateWorkspaceInviteCode(@Member() member: WorkspaceMember) {
    return this.service
      .generateInviteCode(member.workspace)
      .then((result) => result.inviteCode);
  }

  @Query(() => WorkspaceInviteInformation)
  @Auth()
  async getWorkspaceInviteInformation(@Args('inviteCode') inviteCode: string) {
    return this.service.inviteInformation(inviteCode);
  }

  @Query(() => String)
  async getRandomWorkspaceCode(@Args('name') name: string) {
    return this.service.randomCode(name);
  }
}
