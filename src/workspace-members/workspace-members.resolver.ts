import {
  Args,
  ArgsType,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Auth, Member, User } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { UserEntity } from '../users/entities/user.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from './entities/workspace-member.entity';
import { WorkspaceMembersService } from './workspace-members.service';
import {
  AssignWorkspaceMemberRolesArgs,
  TransferOwnerInput,
  UpdateWorkspaceMemberInput,
  UserPublicInformation,
  WorkspaceMemberOnlineStatus,
} from './workspace-members.types';

@ArgsType()
export class WorkspaceMembersArgs extends DynamicPaginatedArgs {
  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  ignoreSelf: boolean;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  userId?: string[] | null;
}

@ObjectType()
export class WorkspaceMembersPaginated extends PaginatedResponse(
  WorkspaceMemberPublicInfo,
) {}

@Resolver(() => WorkspaceMemberPublicInfo)
export class WorkspaceMembersResolver {
  constructor(private readonly service: WorkspaceMembersService) {}

  @Query(() => WorkspaceMembersPaginated)
  @Auth({ member: true })
  async getWorkspaceMembers(
    @Member() member: WorkspaceMember,
    @Args() args: WorkspaceMembersArgs,
  ): Promise<WorkspaceMembersPaginated> {
    const { data, count } = await this.service.list({
      member,
      query: normalizeQuery(args),
    });

    return {
      results: data,
      total: count,
    };
  }

  @Query(() => WorkspaceMemberPublicInfo)
  @Auth({ member: true })
  async getWorkspaceMemberByUserId(
    @Args('userId') userId: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.getMemberInfo({
      userId,
      workspaceId: member.workspaceId,
    });
  }

  @Query(() => UserPublicInformation)
  @Auth()
  async getUserPublicInformation(
    @Args('userId') userId: string,
    @User() user: UserEntity,
  ) {
    return this.service.getUserPublicInformation(userId, user);
  }

  @Query(() => [WorkspaceMemberPublicInfo])
  @Auth({ member: true })
  async getWorkspaceMembersByIds(
    @Args('ids', { type: () => [String] }) userIds: string[],
    @Member() member: WorkspaceMember,
  ) {
    return this.service.getInfoByUserIds({
      userIds,
      workspaceId: member.workspaceId,
    });
  }

  @Query(() => WorkspaceMemberPublicInfo)
  @Auth({ member: true })
  async getUserWorkspaceMember(@Member() member: WorkspaceMember) {
    return this.service.getMemberInfo({
      userId: member.userId,
      workspaceId: member.workspaceId,
    });
  }

  @Query(() => [WorkspaceMemberPublicInfo])
  @Auth()
  async getUserWorkspaceMembers(@User() user: UserEntity) {
    return this.service.getMemberInfos({
      userId: user._id.toString(),
    });
  }

  @Query(() => [WorkspaceMemberOnlineStatus])
  @Auth({ member: true })
  async getWorkspaceMembersOnlineStatus(@Member() member: WorkspaceMember) {
    return this.service.onlineStatus(member.workspaceId);
  }

  @Mutation(() => WorkspaceMemberPublicInfo)
  @Auth({ member: true })
  async updateWorkspaceMember(
    @Member() member: WorkspaceMember,
    @Args('input') input: UpdateWorkspaceMemberInput,
    @Args('memberId') memberId: string,
  ) {
    return this.service
      .update({ member, input, memberId })
      .then((result) => this.service.getMemberInfo(result));
  }

  @Mutation(() => WorkspaceMemberPublicInfo)
  @Auth({ permission: WorkspacePermission.WORKSPACE_MEMBERS_MANAGER })
  async assignWorkspaceMemberRoles(
    @Member() member: WorkspaceMember,
    @Args() args: AssignWorkspaceMemberRolesArgs,
  ) {
    return this.service
      .assignRoles({ member, ...args })
      .then((result) => this.service.getMemberInfo(result));
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_MEMBERS_MANAGER })
  async removeWorkspaceMember(
    @Member() member: WorkspaceMember,
    @Args('memberId', { type: () => String }) memberId: string,
  ) {
    await this.service.remove({ memberId, member });
    return true;
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async transferWorkspaceOwner(
    @Member() member: WorkspaceMember,
    @Args('input') input: TransferOwnerInput,
  ) {
    await this.service.transferOwner(member.workspace, member, input);
    return true;
  }

  @Mutation(() => String)
  @Auth()
  async joinWorkspaceWithInviteCode(
    @User() user: UserEntity,
    @Args('inviteCode', { type: () => String }) inviteCode: string,
  ) {
    const member = await this.service.joinWithInviteCode(user, inviteCode);
    return member.workspaceId;
  }
}
