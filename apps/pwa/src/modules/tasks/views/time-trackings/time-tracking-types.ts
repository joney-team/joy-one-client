import { GetTasksQuery } from "../../graphql/getTasks.graphql";

export type TaskTimeTrackingUser = NonNullable<
  GetTasksQuery["list"]["results"][number]["timeTrackings"]
>[number]["user"];

export type TaskTimeTracking = NonNullable<
  GetTasksQuery["list"]["results"][number]["timeTrackings"]
>[number];
