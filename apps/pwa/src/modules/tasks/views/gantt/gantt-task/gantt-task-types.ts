import { TaskDataFragment } from "../../../queries/fragmentTask.graphql";
import { TasksQueryVariables } from "../../../queries/queryTasks.graphql";

export interface GanttTaskProps {
  task: TaskDataFragment;
  prevTask?: TaskDataFragment;
  nextTask?: TaskDataFragment;
  nextParentTask?: TaskDataFragment;
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
