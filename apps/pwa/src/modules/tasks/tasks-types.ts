import type { TagEntity } from "@/modules/tags/tags-types";
import { WorkspaceMemberDataFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";
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
  user: WorkspaceMemberDataFragment;
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

export interface TasksContext {
  view: TaskView;
  setView: (view: TaskView) => void;
  state: TasksState;
  setState: (val: TasksState | ((prevState: TasksState) => TasksState)) => void;
  activatedFolder: Pick<TagEntity, "_id" | "name" | "slug" | "color" | "__typename"> | null;
  isReady: boolean;
}
