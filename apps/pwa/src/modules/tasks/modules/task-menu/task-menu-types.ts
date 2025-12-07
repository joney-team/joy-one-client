import { type TaskDataFragment } from "../../queries/fragmentTask.graphql";
import { TasksQueryVariables } from "../../queries/queryTasks.graphql";

export enum TaskMenuAction {
  CHANGE_STATUS = "CHANGE_STATUS",
  CHANGE_PRIORITY = "CHANGE_PRIORITY",
  CHANGE_ESTIMATED_TIME = "CHANGE_ESTIMATED_TIME",
  CHANGE_ASSIGNEE = "CHANGE_ASSIGNEE",
  CHANGE_TAGS = "CHANGE_TAGS",
  CHANGE_CUSTOM_FIELDS = "CHANGE_CUSTOM_FIELDS",
  CHANGE_DESCRIPTION = "CHANGE_DESCRIPTION",
  CHANGE_NAME = "CHANGE_NAME",
  CHANGE_ORDER = "CHANGE_ORDER",
}

export interface TaskMenu {
  action?: TaskMenuAction;
  task: TaskDataFragment;
  groupVariables: TasksQueryVariables | null;
  target: HTMLElement;
  position?: { x?: number; y?: number };
  offset?: { x?: number; y?: number };
}

export interface TaskMenuContextType {
  open: (menu: TaskMenu) => void;
  setRoot: (root: HTMLElement | null) => void;
}
