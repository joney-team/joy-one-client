import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { DynamicPaginatedArgs } from '../database/database.utils';
import { WorkspaceMemberPublicInfo } from '../workspace-members/entities/workspace-member.entity';
import { TaskEntity } from './entities/task.entity';

export enum DefaultTaskStatusId {
  TODO = 'TODO',
  CLOSED = 'CLOSED',
}

export enum TaskContextType {
  FOLDER = 'FOLDER',
}

registerEnumType(TaskContextType, {
  name: 'TaskContextType',
  description: 'Available task statuses context types',
});

@ObjectType()
export class TaskStatus {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field(() => Number)
  @IsNumber()
  order: number;

  @Field(() => Number)
  @IsNumber()
  progress: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  contextId?: string;

  @Field(() => TaskContextType, { nullable: true })
  @IsEnum(TaskContextType)
  @IsOptional()
  contextType?: TaskContextType;
}

@InputType()
export class TaskStatusInput {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  order?: number;
}

@ArgsType()
export class UpdateTaskStatusesArgs {
  @Field(() => TaskContextType, { nullable: true })
  @IsEnum(TaskContextType)
  @IsOptional()
  contextType?: TaskContextType | null;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  contextId?: string | null;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isInherited?: boolean | null;

  @Field(() => [TaskStatusInput])
  @IsArray()
  statuses: TaskStatusInput[];
}

export enum GetTaskStatusesMode {
  EDIT = 'edit',
  VIEW = 'view',
}

registerEnumType(GetTaskStatusesMode, {
  name: 'GetTaskStatusesMode',
  description: 'Available task statuses modes',
});

@ArgsType()
export class GetTaskStatusesArgs {
  @Field(() => TaskContextType, { nullable: true })
  @IsEnum(TaskContextType)
  @IsOptional()
  contextType?: TaskContextType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  contextId?: string;

  @Field(() => GetTaskStatusesMode, { nullable: true })
  @IsEnum(GetTaskStatusesMode)
  @IsOptional()
  mode?: GetTaskStatusesMode | null;
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

registerEnumType(TaskPriority, {
  name: 'TaskPriority',
  description: 'Available task priorities',
});

@InputType()
export class CreateTaskInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  _id?: string | null;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  customerId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field(() => TaskPriority, { nullable: true })
  @ApiProperty()
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  startDate?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  dueDate?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  order?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  points?: number;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  assigneeUserIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  partnerIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  folderId?: string;

  @Field(() => [TaskTimeTrackingInput], { nullable: true })
  @IsArray()
  @IsOptional()
  timeTrackings?: TaskTimeTrackingInput[];

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  estimatedTime?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  workspaceBranchId?: string;
}

@InputType()
export class UpdateTaskInput extends CreateTaskInput {
  @Field(() => String)
  @IsString()
  _id: string;
}

@ArgsType()
export class BulkUpdateTaskInput {
  @Field(() => [UpdateTaskInput])
  @IsArray()
  items: UpdateTaskInput[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  sessionId?: string;
}

@ArgsType()
export class DuplicateTaskInput {
  @Field(() => String)
  @IsString()
  _id: string;

  @Field(() => CreateTaskInput, { nullable: true })
  @IsObject()
  @IsOptional()
  overwrite?: CreateTaskInput;
}

@ObjectType()
export class TasksTimeSeriesReport {
  @Field()
  total: number;

  @Field()
  hasDueDate: number;

  @Field()
  completed: number;

  @Field()
  overdue: number;
}

@ObjectType()
export class TasksMetricsReport {
  @Field()
  todo: number;

  @Field()
  inProgress: number;

  @Field()
  overdue: number;
}

@ObjectType()
export class TaskTimeTracking {
  @Field(() => String)
  id: string;

  @Field(() => String)
  workspaceId: string;

  @Field(() => String)
  userId: string;

  @Field(() => WorkspaceMemberPublicInfo)
  user: WorkspaceMemberPublicInfo;

  @Field(() => String, { nullable: true })
  note?: string;

  @Field(() => Number)
  startAt: number;

  @Field(() => Number, { nullable: true })
  endAt?: number;
}

@InputType()
export class TaskTimeTrackingInput {
  @Field(() => String)
  @IsString()
  id: string;

  @Field()
  @IsString()
  workspaceId: string;

  @Field()
  @IsString()
  userId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => Number)
  @IsNumber()
  startAt: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  endAt?: number;
}

export interface TaskEventData {
  name: string;
  code: string;
  taskStatus: string;
  relatedUserIds: string[];
  member: string;
}

@ArgsType()
export class TaskPaginatedArgs extends DynamicPaginatedArgs {
  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isProgressOnly?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isClosedOnly?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  folderId?: string;

  @Field(() => TaskPriority, { nullable: true })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;

  @Field(() => [String!], { nullable: true })
  @IsArray()
  @IsOptional()
  assigneeUserIds?: string[];

  @Field(() => [String!], { nullable: true })
  @IsArray()
  @IsOptional()
  partnerIds?: string[];

  @Field(() => [String!], { nullable: true })
  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  all?: boolean;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  fromTrackingTime?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  toTrackingTime?: number;
}

@ObjectType()
export class SiblingTasks {
  @Field(() => TaskEntity, { nullable: true })
  next: TaskEntity | null;

  @Field(() => TaskEntity, { nullable: true })
  previous: TaskEntity | null;
}

@ObjectType()
export class SyncTaskResult {
  @Field(() => TaskEntity)
  task: TaskEntity;

  @Field(() => [String])
  updateInfos: string[];
}

@ObjectType()
export class TaskChildOrder {
  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  first?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  last?: number;
}

@ObjectType()
export class TaskChildTimeline {
  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  startDate?: number | null;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  dueDate?: number | null;
}

@ArgsType()
export class TaskMetricsArgs {
  @Field(() => TaskContextType)
  @IsEnum(TaskContextType)
  contextType: TaskContextType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  contextId: string | null;
}
