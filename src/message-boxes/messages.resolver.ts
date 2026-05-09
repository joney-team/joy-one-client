import {
  Args,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { MessagesService } from './messages.service';
import { MessageEntity } from './entities/message.entity';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from 'src/database/database.utils';
import { Auth, Member } from 'src/app.decorators';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from 'src/workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from 'src/workspace-members/workspace-members.service';
import { forwardRef, Inject } from '@nestjs/common';

@ObjectType()
export class MessagesPaginated extends PaginatedResponse(MessageEntity) {}

@Resolver(() => MessageEntity)
export class MessagesResolver {
  constructor(
    private readonly service: MessagesService,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private readonly workspaceMembers: WorkspaceMembersService,
  ) {}

  @Query(() => MessagesPaginated)
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async getMessages(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({ member, query: normalizeQuery(args) });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, {
    nullable: true,
    name: 'user',
  })
  async resolveUser(@Parent() message: MessageEntity) {
    if (!message.userId) return null;
    return this.workspaceMembers.getMemberInfo({
      userId: message.userId,
      workspaceId: message.workspaceId,
    });
  }
}
