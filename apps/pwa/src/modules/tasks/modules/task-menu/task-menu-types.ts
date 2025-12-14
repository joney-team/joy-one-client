import { OpenContextMenuArgs } from "@/components/context-menu/context-menu-types";
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

export type TaskMenuData = Partial<TaskDataFragment> & { _id: string };

export type TaskMenuContext = {
  groupVariables: TasksQueryVariables | null;
  action: TaskMenuAction;
  updateTask?: (task: UpdateTask) => Promise<void>;
};

export interface TaskMenuContextType {
  open: (
    menu: { task?: TaskMenuData; action: TaskMenuAction } & Omit<
      TaskMenuContext,
      "groupVariables" | "action"
    > &
      Pick<OpenContextMenuArgs, "offset" | "target" | "zIndex">
  ) => void;
  close: () => void;
  activatedAction: TaskMenuAction | null;
  isOpened: boolean;
}

export type TaskMenuComponentProps = Pick<TaskMenuContext, "groupVariables" | "action"> & {
  task: TaskMenuData;
  onClose: () => void;
  updateTask: (task: UpdateTask) => Promise<void>;
  setClickOutsideToClose: (enabled: boolean) => void;
};

export type TaskMenuComponent = FC<TaskMenuComponentProps>;
