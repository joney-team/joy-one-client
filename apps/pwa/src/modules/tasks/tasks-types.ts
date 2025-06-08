
import type { AppRouter } from "@/hooks/use-router";
import type { BaseMongoEntity } from "@/types";
import type { CustomerShortInfo } from "@/modules/customers/customer-types";
import type { PartnerEntity } from "@/modules/partners/partners-types";
import type { TagEntity } from "@/modules/tags/tags-types";
import type { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import type { Params } from "next/dist/server/request/params";
import type { Dispatch, SetStateAction } from "react";
import type { TasksState } from "./tasks-provider";
import type { TaskView } from "./views/types";

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
  isArchived?: boolean;
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

export interface TasksContext {
  views: TaskView[],
  view: TaskView,
  setView: (view: TaskView) => void,
  state: TasksState,
  setState: Dispatch<SetStateAction<TasksState>>,
  tagFolder?: TagEntity,
  tagFolders: TagEntity[],
  isInitialized: boolean,
  statuses: TaskStatus[],
  open: (task: TaskEntity) => void,
  openFolder: (tagFolder: TagEntity) => void
  removeFolder: () => void
  redirectToDefaultView: () => void,
  viewFromPathname?: TaskView | null,
  taskCode?: string | null,
  router: AppRouter,
  params: Params,
  getSelectedView: () => TaskView,
  selectedTaskIds: string[],
  toggleSelectTask: (taskId: string, isShiftKey?: boolean) => void,
  removeSelectedTasks: (specificTaskIds?: string[]) => void,
}

export interface TaskHistoriesContext {
  pointedHistoryId: string | null;
  switchHistory: (id: string, position: 'prev' | 'next') => void;
  histories: TaskHistory[];
}