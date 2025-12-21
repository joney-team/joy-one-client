import type { CustomerShortInfo } from "@/modules/customers/customer-types";
import type { PartnerEntity } from "@/modules/partners/partners-types";
import type { TagEntity } from "@/modules/tags/tags-types";
import type { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import type { BaseMongoEntity } from "@/types";
import type { TasksState } from "./tasks-provider";
import type { TaskView } from "./views/types";

export enum DefaultTaskStatusId {
  TODO = "TODO",
  CLOSED = "CLOSED",
}

export interface TaskStatus {
  id: string;
  name?: string | null;
  color?: string | null;
  icon?: string | null;
  isDefault?: boolean;
  order: number;
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface TaskTimeTracking {
  id: string;
  userId: string;
  user: WorkspaceMemberInfo;
  startAt: number;
  endAt?: number;
  note?: string;
}

export interface TaskDto {
  name: string;
  order?: number;
  parentId?: string | null;
  description?: string | null;
  customerId?: string | null;
  status?: string | null;
  priority?: TaskPriority | null;
  startDate?: number | null;
  dueDate?: number | null;
  assigneeUserIds?: string[];
  partnerIds?: string[];
  folderId?: string | null;
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
  customerId?: string | null;
  customer?: Pick<CustomerShortInfo, "_id" | "name" | "phone" | "avatar"> | null;
  isArchived?: boolean;
  folderId?: string | null;
  tags: TagEntity[];
  tagIds?: string[];
  closedAt?: number | null;
  timeTrackings?: TaskTimeTracking[];
  estimatedTime?: number | null;
  relatedUserIds?: string[];
}

export enum ReorderTaskPotision {
  BEFORE = "BEFORE",
  AFTER = "AFTER",
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
  type: "UPDATE" | "ARCHIVE";
  tasks: TaskEntity[];
  prevTasks?: TaskEntity[] | null;
}

export interface TasksContext {
  view: TaskView;
  setView: (view: TaskView) => void;
  state: TasksState;
  setState: (val: TasksState | ((prevState: TasksState) => TasksState)) => void;
  activatedFolder: Pick<TagEntity, "_id" | "name" | "slug" | "color" | "__typename"> | null;
  isReady: boolean;
}

export interface TaskHistoriesContext {
  pointedHistoryId: string | null;
  switchHistory: (id: string, position: "prev" | "next") => void;
  histories: TaskHistory[];
}
