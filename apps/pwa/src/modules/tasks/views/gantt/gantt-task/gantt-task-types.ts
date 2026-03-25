import { TaskFragment } from "../../../graphql/fragmentTask.graphql";
import { TasksQueryVariables } from "../../../graphql/queryTasks.graphql";

export interface GanttTaskProps {
  task: TaskFragment;
  prevTask: TaskFragment | null;
  nextTask: TaskFragment | null;
  nextParentTask: TaskFragment | null;
  groupVariables: TasksQueryVariables | null;
  isAllowTopDroppable?: boolean;
}

export type GanttTaskTimeline = {
  startIndex: number;
  endIndex: number;
  left: number;
  width: number;
  isChildSummary: boolean;
  isCanMove: boolean;
  startDate: number;
  dueDate: number;
};
