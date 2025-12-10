"use client";

import { TaskStatus } from "@/graphql/types.graphql";
import { useMemo } from "react";
import { TaskDataFragment } from "../graphql/fragmentTask.graphql";
import { normalizeTaskStatuses } from "../task-constants";

export const useTaskStatuses = (task: Pick<TaskDataFragment, "status" | "statuses">) => {
  const statuses = useMemo<TaskStatus[]>(() => {
    return normalizeTaskStatuses(task.statuses);
  }, [task.status, task.statuses]);

  const status = useMemo<TaskStatus>(() => {
    return statuses.find((s) => s.id === task.status) ?? statuses[0];
  }, [task.status, statuses]);

  return { statuses, status };
};
