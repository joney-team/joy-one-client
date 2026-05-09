import { forwardRef, Inject } from '@nestjs/common';
import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import { CustomFieldEntity } from '../custom-fields/custom-fields.entity';
import { CustomFieldsService } from '../custom-fields/custom-fields.service';
import { CustomerEntity } from '../customers/customers.entity';
import { CustomersService } from '../customers/customers.service';
import { PaginatedResponse } from '../database/database.utils';
import { PartnerEntity } from '../partners/partners.entity';
import { PartnersService } from '../partners/partners.service';
import { TagEntity } from '../tags/entities/tag.entity';
import { TagsService } from '../tags/tags.service';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { TaskMetrics } from './entities/task-metrics.entity';
import { TaskEntity } from './entities/task.entity';
import { TasksService } from './tasks.service';
import {
  BulkUpdateTaskInput,
  CreateTaskInput,
  DuplicateTaskInput,
  GetTaskStatusesArgs,
  SiblingTasks,
  SyncTaskResult,
  TaskMetricsArgs,
  TaskPaginatedArgs,
  TaskStatus,
  TaskTimeTracking,
  UpdateTaskStatusesArgs,
} from './tasks.types';

@ObjectType()
export class TasksPaginated extends PaginatedResponse(TaskEntity) {}

@ObjectType()
export class ConfigTaskStatuses {
  @Field(() => [TaskStatus])
  statuses: TaskStatus[];

  @Field(() => [TaskStatus])
  workspaceStatuses: TaskStatus[];

  @Field(() => Boolean)
  isInherited: boolean;
}

@Resolver(() => TaskEntity)
export class TasksResolver {
  constructor(
    private readonly service: TasksService,
    private readonly customers: CustomersService,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly partners: PartnersService,
    private readonly tags: TagsService,
    private readonly customFields: CustomFieldsService,
  ) {}

  @Query(() => TaskMetrics)
  @Auth({ member: true })
  async getTaskMetrics(
    @Member() member: WorkspaceMember,
    @Args() args: TaskMetricsArgs,
  ) {
    return this.service.metric({ workspaceId: member.workspaceId, ...args });
  }

  @Query(() => ConfigTaskStatuses)
  @Auth({ member: true })
  async getTaskStatuses(
    @Member() member: WorkspaceMember,
    @Args() args: GetTaskStatusesArgs,
  ) {
    return this.service.getStatuses({
      workspaceId: member.workspaceId,
      ...args,
    });
  }

  @Mutation(() => [TaskStatus])
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async updateTaskStatuses(
    @Member() member: WorkspaceMember,
    @Args() dto: UpdateTaskStatusesArgs,
  ) {
    return this.service.updateTaskStatuses({ member, ...dto });
  }

  @Query(() => TaskEntity)
  @Auth({ member: true })
  async getTaskByCode(
    @Member() member: WorkspaceMember,
    @Args('code', { type: () => String }) code: string,
  ) {
    return this.service.getByCode({ code, member });
  }

  @Query(() => SiblingTasks)
  @Auth({ member: true })
  async getSiblingTasks(
    @Member() member: WorkspaceMember,
    @Args('_id', { type: () => String }) _id: string,
  ) {
    return this.service.getSiblingTasks({
      _id: _id,
      workspaceId: member.workspaceId,
    });
  }

  @Query(() => TaskEntity)
  @Auth({ member: true })
  async getTaskById(
    @Member() member: WorkspaceMember,
    @Args('_id', { type: () => String }) _id: string,
  ) {
    return this.service.get({ _id: _id, workspaceId: member.workspaceId });
  }

  @Query(() => TasksPaginated)
  @Auth({ member: true })
  async getTasks(
    @Member() member: WorkspaceMember,
    @Args() args: TaskPaginatedArgs,
  ) {
    return this.service.listWithCache({ query: args, member });
  }

  @Query(() => Number)
  @Auth({ member: true })
  async getTasksCount(
    @Member() member: WorkspaceMember,
    @Args() args: TaskPaginatedArgs,
  ) {
    const { count } = await this.service.listCountedWithCache({
      query: args,
      member,
    });
    return count;
  }

  @Mutation(() => TaskEntity)
  @Auth({ member: true })
  async createTask(
    @Member() member: WorkspaceMember,
    @Args('input') input: CreateTaskInput,
  ) {
    return this.service.create({ member, input });
  }

  @Mutation(() => TaskEntity)
  @Auth({ member: true })
  async duplicateTask(
    @Member() member: WorkspaceMember,
    @Args() input: DuplicateTaskInput,
  ) {
    return this.service.duplicate({ member, ...input });
  }

  @Mutation(() => [TaskEntity])
  @Auth({ member: true })
  async bulkUpdateTasks(
    @Member() member: WorkspaceMember,
    @Args() args: BulkUpdateTaskInput,
  ) {
    return this.service.bulkUpdate({ member, ...args });
  }

  @Mutation(() => SyncTaskResult)
  @Auth({ member: true })
  async syncTask(
    @Member() member: WorkspaceMember,
    @Args('_id', { type: () => String }) _id: string,
  ) {
    return this.service.sync({
      _id: _id,
      workspaceId: member.workspaceId,
    });
  }

  @ResolveField(() => CustomerEntity, { name: 'customer', nullable: true })
  async resolveCustomer(@Parent() task: TaskEntity) {
    if (!task.customerId) return null;
    return this.customers.getWithCache({
      id: task.customerId,
      workspaceId: task.workspaceId,
    });
  }

  @ResolveField(() => [WorkspaceMemberPublicInfo], { name: 'assigneeUsers' })
  async resolveAssigneeUsers(@Parent() task: TaskEntity) {
    return this.workspaceMembers.getInfoByUserIds({
      userIds: task.assigneeUserIds,
      workspaceId: task.workspaceId,
    });
  }

  @ResolveField(() => [PartnerEntity], { name: 'partners' })
  async resolvePartners(@Parent() task: TaskEntity) {
    if ((task.partnerIds ?? []).length === 0) return [];
    return this.partners.getByIds(task.partnerIds);
  }

  @ResolveField(() => [TagEntity], { name: 'tags' })
  async resolveTags(@Parent() task: TaskEntity) {
    if ((task.tagIds ?? []).length === 0) return [];
    return this.tags.getByIds(task.tagIds);
  }

  @ResolveField(() => [CustomFieldEntity], { name: 'customFields' })
  async resolveCustomFields(@Parent() task: TaskEntity) {
    return this.customFields.bindCustomFieldValues(task);
  }

  @ResolveField(() => TaskEntity, { name: 'parent', nullable: true })
  async resolveParent(@Parent() task: TaskEntity) {
    if (!task.parentId) return null;
    return this.service.getWithCache({
      _id: task.parentId,
      workspaceId: task.workspaceId,
    });
  }

  @ResolveField(() => TagEntity, { name: 'folder', nullable: true })
  async resolveFolder(@Parent() task: TaskEntity) {
    if (!task.folderId) return null;
    return this.tags.getInternal(task.folderId);
  }

  @ResolveField(() => [TaskStatus], { name: 'statuses' })
  async resolveStatuses(@Parent() task: TaskEntity) {
    return this.service.getTaskStatuses(task);
  }
}

@Resolver(() => TaskTimeTracking)
export class TaskTimeTrackingResolver {
  constructor(private readonly workspaceMembers: WorkspaceMembersService) {}

  @ResolveField(() => WorkspaceMemberPublicInfo, {
    name: 'user',
    nullable: true,
  })
  async resolveUser(@Parent() timeTracking: TaskTimeTracking) {
    if (!timeTracking.workspaceId) return null;

    return this.workspaceMembers.getMemberInfo({
      userId: timeTracking.userId,
      workspaceId: timeTracking.workspaceId,
    });
  }
}
