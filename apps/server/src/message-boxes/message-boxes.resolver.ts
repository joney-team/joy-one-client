import { forwardRef, Inject } from '@nestjs/common';
import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member } from 'src/app.decorators';
import { CustomerEntity } from 'src/customers/customers.entity';
import { CustomersService } from 'src/customers/customers.service';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from 'src/database/database.utils';
import { MessageEntity } from 'src/message-boxes/entities/message.entity';
import { MessagesService } from 'src/message-boxes/messages.service';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from 'src/workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from 'src/workspace-members/workspace-members.service';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { MessageBoxEntity } from './entities/message-box.entity';
import { MessageBoxesService } from './message-boxes.service';
import { MessageBoxPlatform } from './message-boxes.types';

@ObjectType()
export class MessageBoxesPaginated extends PaginatedResponse(
  MessageBoxEntity,
) {}

@Resolver(() => MessageBoxEntity)
export class MessageBoxesResolver {
  constructor(
    private readonly service: MessageBoxesService,
    private readonly messages: MessagesService,

    @Inject(forwardRef(() => CustomersService))
    private readonly customers: CustomersService,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private readonly workspaceMembers: WorkspaceMembersService,
  ) {}

  @Query(() => [MessageBoxPlatform])
  @Auth({ member: true })
  async getMessageBoxPlatforms(@Member() member: WorkspaceMember) {
    return this.service.listPlatforms({ member });
  }

  @Query(() => MessageBoxesPaginated)
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async getMessageBoxes(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({ member, query: normalizeQuery(args) });
  }

  @Query(() => [MessageBoxEntity])
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async getMessageBoxesByIds(
    @Member() member: WorkspaceMember,
    @Args('ids', { type: () => [String] }) ids: string[],
  ) {
    return this.service.getByIds({ ids, member });
  }

  @Query(() => MessageBoxEntity)
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async getMessageBoxById(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.get({ id, member });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async sendTextToMessageBox(
    @Member() member: WorkspaceMember,
    @Args('boxId') boxId: string,
    @Args('text', { type: () => String }) text: string,
  ) {
    await this.service.sendText({
      member,
      boxId,
      input: { text },
    });

    return true;
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async sendImageToMessageBox(
    @Member() member: WorkspaceMember,
    @Args('boxId') boxId: string,
    @Args('url', { type: () => String }) url: string,
    @Args('text', { type: () => String, nullable: true }) text?: string,
  ) {
    await this.service.sendImage({
      member,
      boxId,
      input: { url, text },
    });

    return true;
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async sendFileToMessageBox(
    @Member() member: WorkspaceMember,
    @Args('boxId') boxId: string,
    @Args('url', { type: () => String }) url: string,
    @Args('text', { type: () => String, nullable: true }) text?: string,
  ) {
    await this.service.sendFile({
      member,
      boxId,
      input: { url, text },
    });

    return true;
  }

  @Mutation(() => MessageBoxEntity)
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async setMessageBoxCustomer(
    @Member() member: WorkspaceMember,
    @Args('boxId') boxId: string,
    @Args('customerId', { nullable: true }) customerId?: string,
  ) {
    return this.service.setCustomer({
      member,
      id: boxId,
      customerId: customerId || null,
    });
  }

  @Mutation(() => MessageBoxEntity)
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async switchMessageBoxAiAssistant(
    @Member() member: WorkspaceMember,
    @Args('boxId') boxId: string,
    @Args('disabled', { type: () => Boolean }) disabled: boolean,
  ) {
    return this.service.switchAiAssistant({
      member,
      boxId,
      disabled,
    });
  }

  @Mutation(() => MessageBoxEntity)
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async assignUserToMessageBox(
    @Member() member: WorkspaceMember,
    @Args('boxId') boxId: string,
    @Args('userId', { nullable: true }) userId?: string,
  ) {
    return this.service.assignUser({
      member,
      id: boxId,
      userId: userId || null,
    });
  }

  @Mutation(() => MessageBoxEntity)
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async closeMessageBox(
    @Member() member: WorkspaceMember,
    @Args('boxId') boxId: string,
  ) {
    return this.service.close({ member, id: boxId });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.MESSAGE_BOXES_MANAGER })
  async deleteMessageBox(
    @Member() member: WorkspaceMember,
    @Args('boxId') boxId: string,
  ) {
    await this.service.delete({ member, id: boxId });
    return true;
  }

  @ResolveField(() => CustomerEntity, { name: 'customer', nullable: true })
  async resolveCustomer(@Parent() box: MessageBoxEntity) {
    if (!box.customerId) return null;
    return this.customers.get({
      id: box.customerId,
      workspaceId: box.workspaceId,
    });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, {
    name: 'assigneeUser',
    nullable: true,
  })
  async resolveAssigneeUser(@Parent() box: MessageBoxEntity) {
    if (!box.assigneeUserId) return null;
    return this.workspaceMembers.getMemberInfo({
      userId: box.assigneeUserId,
      workspaceId: box.workspaceId,
    });
  }

  @ResolveField(() => MessageEntity, { name: 'lastMessage', nullable: true })
  async resolveLastMessage(@Parent() box: MessageBoxEntity) {
    return this.messages
      .list({
        workspaceId: box.workspaceId,
        query: {
          boxId: box._id.toString(),
          limit: 1,
        },
      })
      .then((messages) => messages.results[0]);
  }
}
