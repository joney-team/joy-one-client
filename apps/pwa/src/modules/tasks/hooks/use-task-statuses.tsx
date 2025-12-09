"use client";

import { useColor } from "@/modules/theme/use-color";
import { TaskDataFragment } from "../graphql/fragmentTask.graphql";
import { useMemo } from "react";
import { defaultTaskStatusIds } from "../task-constants";
import { DefaultTaskStatusId } from "../tasks-types";
import { TaskStatus } from "@/graphql/types.graphql";

export const useTaskStatuses = (task: Pick<TaskDataFragment, "status" | "statuses">) => {
  const color = useColor();

  const statuses = useMemo(() => {
    return Array.from(task.statuses)
      .map((status) => ({
        ...status,
        color: color(status.color ?? "transparent"),
        name: status.name ?? defaultTaskStatusIds[status.id as DefaultTaskStatusId]?.label(),
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [color, task.status, task.statuses]);

  const status = useMemo<TaskStatus | null>(() => {
    return statuses.find((s) => s.id === task.status) ?? statuses[0];
  }, [task.status, statuses, task.statuses]);

  return { statuses: statuses, status };
};
