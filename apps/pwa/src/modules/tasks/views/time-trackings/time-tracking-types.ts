import { TasksQuery } from "../../graphql/queryTasks.graphql";

export type TaskTimeTrackingUser = NonNullable<
  TasksQuery["tasks"]["data"][number]["timeTrackings"]
>[number]["user"];

export type TaskTimeTracking = NonNullable<
  TasksQuery["tasks"]["data"][number]["timeTrackings"]
>[number];
