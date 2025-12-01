import { TaskDataFragment } from "../../queries/fragmentTask.graphql";

export type TaskRow = { __typename: "Task"; task?: TaskDataFragment };
export type FolderRow = { __typename: "Folder"; folder?: TaskDataFragment };
export type LoadingIndicatorRow = { __typename: "LoadingIndicator" };

export type GanttTaskRow = TaskRow | FolderRow | LoadingIndicatorRow;
