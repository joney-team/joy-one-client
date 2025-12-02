import { Task } from "@/graphql/types.graphql";
import { TagDataFragment } from "@/modules/tags/queries/fragmentTag.graphql";

export type GanttRowTask = { __typename: "Task"; task: Task };
export type GanttRowFolder = { __typename: "Folder"; folder: TagDataFragment };
export type GanttRowLoadingIndicator = { __typename: "LoadingIndicator" };

export type GanttRow = GanttRowTask | GanttRowFolder | GanttRowLoadingIndicator;
