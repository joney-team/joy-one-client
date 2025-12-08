import { TaskStatus } from "@/graphql/types.graphql";
import { TaskDataFragment } from "../../../graphql/fragmentTask.graphql";
import { TasksQueryVariables } from "../../../graphql/queryTasks.graphql";

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
