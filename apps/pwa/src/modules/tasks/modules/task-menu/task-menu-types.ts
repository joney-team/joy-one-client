import type { PlaceDropdownMenuOptions } from "@/components/context-menu/context-menu-helpers";
import type { ContextMenuProps } from "@/components/context-menu/context-menu-types";
import type { FC } from "react";
import type { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import type { TasksQueryVariables } from "../../graphql/queryTasks.graphql";
import type { UpdateTask } from "../../hooks/use-update-tasks";

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
  updateTask?: (task: UpdateTask) => Promise<void>;
  action: TaskMenuAction;
};

export interface TaskMenuContextType {
  open: (menu: {
    target: HTMLElement;
    action: TaskMenuAction;
    task?: TaskMenuData;
    options?: PlaceDropdownMenuOptions;
    onClose?: () => void;
    updateTask?: (task: UpdateTask) => Promise<void>;
  }) => void;
  close: () => void;
  activatedAction: TaskMenuAction | null;
  isOpened: boolean;
}

export type TaskMenuComponentProps = Pick<TaskMenuContext, "groupVariables" | "action"> & {
  task: TaskMenuData;
  onClose: () => void;
  updateTask: (task: UpdateTask) => Promise<void>;
  setClickOutsideToClose: (enabled: boolean) => void;
  options?: ContextMenuProps["options"];
};

export type TaskMenuComponent = FC<TaskMenuComponentProps>;
