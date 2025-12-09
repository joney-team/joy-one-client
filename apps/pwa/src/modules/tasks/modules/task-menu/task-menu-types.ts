import { FC } from "react";
import { type TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import { TasksQueryVariables } from "../../graphql/queryTasks.graphql";
import { UpdateTask } from "../../hooks/use-update-tasks";

export enum TaskMenuAction {
  CHANGE_STATUS = "CHANGE_STATUS",
  CHANGE_PRIORITY = "CHANGE_PRIORITY",
  CHANGE_TIMELINE = "CHANGE_TIMELINE",
  CHANGE_ASSIGNEE = "CHANGE_ASSIGNEE",
  CHANGE_TAGS = "CHANGE_TAGS",
  CHANGE_CUSTOMER = "CHANGE_CUSTOMER",
  GANTT_TIMELINE = "GANTT_TIMELINE",
  CHANGE_ESTIMATE_TIME = "CHANGE_ESTIMATE_TIME",
}

export interface TaskMenu {
  action: TaskMenuAction;
  task: Partial<TaskDataFragment> & { _id: string };
  groupVariables: TasksQueryVariables | null;
  target: HTMLElement;
  offset?: { x?: number; y?: number };
  zIndex?: number;
  updateTask?: (task: UpdateTask) => Promise<void>;
}

export interface TaskMenuContextType {
  open: (menu: Omit<TaskMenu, "task" | "groupVariables">) => void;
  close: () => void;
  activatedAction: TaskMenuAction | null;
  isOpened: boolean;
}

export type TaskMenuComponentProps = Pick<TaskMenu, "task" | "groupVariables"> & {
  onClose: () => void;
  updateTask: (task: UpdateTask) => Promise<void>;
  setClickOutsideToClose: (enabled: boolean) => void;
};

export type TaskMenuComponent = FC<TaskMenuComponentProps>;
