import { type TaskDataFragment } from "../../queries/fragmentTask.graphql";
import { TasksQueryVariables } from "../../queries/queryTasks.graphql";

export interface TaskMenu {
  task: TaskDataFragment;
  groupVariables: TasksQueryVariables | null;
  target: HTMLElement;
  position?: { x?: number; y?: number };
  offset?: { x?: number; y?: number };
}

export interface TaskMenuContextType {
  open: (menu: TaskMenu) => void;
  setRoot: (root: HTMLElement | null) => void;
  isOpened: boolean;
}
