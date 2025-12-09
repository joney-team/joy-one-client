import { FC } from "react";
import { type TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import { TasksQueryVariables } from "../../graphql/queryTasks.graphql";

export enum TaskMenuAction {
  CHANGE_STATUS = "CHANGE_STATUS",
  CHANGE_PRIORITY = "CHANGE_PRIORITY",
  CHANGE_ESTIMATED_TIME = "CHANGE_ESTIMATED_TIME",
  CHANGE_ASSIGNEE = "CHANGE_ASSIGNEE",
  CHANGE_TAGS = "CHANGE_TAGS",
  CHANGE_CUSTOMER = "CHANGE_CUSTOMER",
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
  open: (menu: Omit<TaskMenu, "task" | "groupVariables">) => void;
  close: () => void;
  activatedAction: TaskMenuAction | null;
  isOpened: boolean;
}

export type TaskMenuComponentProps = Pick<TaskMenu, "task" | "groupVariables"> & {
  onClose: () => void;
};

export type TaskMenuComponent = FC<TaskMenuComponentProps>;
