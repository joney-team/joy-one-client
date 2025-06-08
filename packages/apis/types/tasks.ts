import { BaseMongoEntity } from "./database";
import { WorkspaceMemberInfo } from "./workspace-members";
import { PartnerEntity } from "./partners";
import { CustomerShortInfo } from "./customers";
import { TagEntity } from "./tags";

export enum DefaultTaskStatusId {
  TODO = 'TODO',
  CLOSED = 'CLOSED',
}

export interface TaskStatus {
  id: string;
  name?: string | null;
  color?: string | null;
  icon?: string | null;
  isDefault?: boolean;
  order?: number;
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface TaskTimeTracking {
  id: string;
  userId: string;
  user: WorkspaceMemberInfo;
  startAt: number;
  endAt?: number;
  note?: string;
  billable?: boolean;
}

export interface TaskDto {
  name: string;
  order?: number;
  parentId?: string | null;
  description?: string | null;
  relatedCustomerId?: string | null;
  status?: string | null;
  priority?: TaskPriority | null;
  startDate?: number | null;
  dueDate?: number | null;
  assigneeUserIds?: string[];
  partnerIds?: string[];
  tagFolderId?: string | null;
  tagIds?: string[];
  timeTrackings?: TaskTimeTracking[];
  estimatedTime?: number | null;
}

export interface UpdateManyTaskDto {
  items: (TaskDto & { _id: string })[];
  sessionId?: string;
}

export interface TaskEntity extends BaseMongoEntity {
  code: string;
  name: string;
  order: number;
  childCount: number;
  parentId?: string | null;
  description?: string;
  status: string;
  priority?: TaskPriority | null;
  startDate?: number | null;
  dueDate?: number | null;
  partnerIds: string[];
  partners: PartnerEntity[];
  workspaceId: string;
  relatedCustomerId?: string | undefined;
  relatedCustomer?: CustomerShortInfo | undefined;
  tagFolderId?: string | undefined;
  tags: TagEntity[];
  tagIds?: string[];
  closedAt?: number | null;
  timeTrackings?: TaskTimeTracking[];
  estimatedTime?: number | null;
  relatedUserIds?: string[];
}

export enum ReorderTaskPotision {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
}

export interface TasksReport {
  total: number;
  hasDueDate: number;
  completed: number;
  overdue: number;
}

export interface TasksRealtimeReport {
  todo: number;
  inProgress: number;
  overdue: number;
}

export interface TaskHistory {
  id: string;
  type: 'UPDATE' | 'ARCHIVE';
  tasks: TaskEntity[];
  prevTasks?: TaskEntity[] | null;
}

export interface TaskHistoriesContext {
  pointedHistoryId: string | null;
  switchHistory: (id: string, position: 'prev' | 'next') => void;
  histories: TaskHistory[];
}

export enum TaskView {
  LIST = "l",
  BOARD = "b",
  GANTT = "g",
  TIME_TRACKINGS = "t",
  CALENDAR = "c",
}