"use client";

import { useColor } from "@/modules/theme/use-color";
import { TaskDataFragment } from "../queries/fragmentTask.graphql";
import { useMemo } from "react";
import { defaultTaskStatusIds } from "../task-constants";
import { DefaultTaskStatusId } from "../tasks-types";

export const useTaskStatuses = (task: Pick<TaskDataFragment, "status" | "statuses">) => {
  const color = useColor();

  const taskStatuses = useMemo(() => {
    return task.statuses
      .map((status) => ({
        ...status,
        color: color(status.color ?? "transparent"),
        name: status.name ?? defaultTaskStatusIds[status.id as DefaultTaskStatusId]?.label(),
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [task.statuses, color]);

  const status = useMemo(() => {
    return taskStatuses.find((s) => s.id === task.status) ?? taskStatuses[0];
  }, [task.status, taskStatuses]);

  return { statuses: taskStatuses, status };
};
