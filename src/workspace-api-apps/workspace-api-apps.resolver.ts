import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { WorkspaceApiAppEntity } from './entities/workspace-api-app.entity';
import {
  DynamicPaginatedArgs,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceApiAppsService } from './workspace-api-apps.service';
import { Auth, Member } from '../app.decorators';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { WorkspaceApiAppInput } from './workspace-api-apps.dtos';
import { WorkspaceMembersService } from 'src/workspace-members/workspace-members.service';

@ObjectType()
export class WorkspaceApiAppsPaginated extends PaginatedResponse(
  WorkspaceApiAppEntity,
) {}

@Resolver(() => WorkspaceApiAppEntity)
export class WorkspaceApiAppsResolver {
  constructor(
    private readonly service: WorkspaceApiAppsService,
    private readonly workspaceMembers: WorkspaceMembersService,
  ) {}

  @Query(() => WorkspaceApiAppsPaginated)
  @Auth({ member: true })
  async getWorkspaceApiApps(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    const { count, data } = await this.service.list({ member, ...args });
    return {
      total: count,
      results: data,
    };
  }

  @Mutation(() => WorkspaceApiAppEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async createWorkspaceApiApp(
    @Member() member: WorkspaceMember,
    @Args('input') input: WorkspaceApiAppInput,
  ) {
    return this.service.create(member, input);
  }

  @Mutation(() => WorkspaceApiAppEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async updateWorkspaceApiApp(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: WorkspaceApiAppInput,
  ) {
    return this.service.update({ id, member, dto: input });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async archiveWorkspaceApiApp(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    await this.service.archive({ id, member });
    return true;
  }

  @Mutation(() => WorkspaceApiAppEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async regenerateWorkspaceApiAppSecret(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.resetSecretKey({ id, member });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, { name: 'member' })
  async resolveAssigneeUsers(@Parent() parent: WorkspaceApiAppEntity) {
    return this.workspaceMembers.getMemberInfo({
      userId: parent.userId,
      workspaceId: parent.workspaceId,
    });
  }
}
