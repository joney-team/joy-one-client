"use client";

import { TaskStatus } from "@/graphql/types.graphql";
import { useMemo } from "react";
import { TaskDataFragment } from "../graphql/fragmentTask.graphql";
import { normalizeTaskStatuses } from "../task-constants";
import { useQuery } from "@apollo/client/react";
import QUERY_TASK_STATUSES, {
  type TaskStatusesQuery,
  type TaskStatusesQueryVariables,
} from "../graphql/queryTaskStatuses.graphql";
import { TaskContextType } from "@/graphql/enums.graphql";
import { DefaultTaskStatusId } from "../tasks-types";

export const useTaskStatuses = (task: Pick<TaskDataFragment, "status" | "statuses">) => {
  const statuses = useMemo<TaskStatus[]>(() => {
    return normalizeTaskStatuses(task.statuses);
  }, [task.status, task.statuses]);

  const status = useMemo<TaskStatus>(() => {
    return statuses.find((s) => s.id === task.status) ?? statuses[0];
  }, [task.status, statuses]);

  return { statuses, status };
};

export const useFolderStatuses = (folderId?: string | null) => {
  const taskStatusesData = useQuery<TaskStatusesQuery, TaskStatusesQueryVariables>(
    QUERY_TASK_STATUSES,
    {
      variables: folderId
        ? {
            contextType: TaskContextType.Folder,
            contextId: folderId,
          }
        : {},
    }
  );

  const statuses = useMemo(() => {
    const selectStatuses = taskStatusesData.data?.taskStatuses.isInherited
      ? taskStatusesData.data?.taskStatuses.workspaceStatuses
      : taskStatusesData.data?.taskStatuses.statuses;

    const allStatus = normalizeTaskStatuses(selectStatuses ?? []);

    return {
      inprogress: allStatus.filter((status) => status.id !== DefaultTaskStatusId.CLOSED),
      closed: allStatus.filter((status) => status.id === DefaultTaskStatusId.CLOSED),
    };
  }, [taskStatusesData.data]);

  return statuses;
};
