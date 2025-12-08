import { FC } from "react";
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
  GANTT_TIMELINE = "GANTT_TIMELINE",
}

export interface TaskMenu {
  action: TaskMenuAction;
  task: TaskDataFragment;
  groupVariables: TasksQueryVariables | null;
  target: HTMLElement;
  offset?: { x?: number; y?: number };
}

export interface TaskMenuContextType {
  open: (menu: Omit<TaskMenu, "task">) => void;
  close: () => void;
  isOpened: boolean;
}

export type TaskMenuComponentProps = Pick<TaskMenu, "task" | "groupVariables"> & {
  onClose: () => void;
};

export type TaskMenuComponent = FC<TaskMenuComponentProps>;
