"use client";

import { TaskContextType } from "@/graphql/enums.graphql";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { TaskDataFragment } from "../graphql/fragmentTask.graphql";
import QUERY_TASK_STATUSES from "../graphql/queryTaskStatuses.graphql";
import { normalizeTaskStatuses } from "../tasks-constants";
import { DefaultTaskStatusId } from "../tasks-types";

export function getTaskStatuses(task: Pick<TaskDataFragment, "status" | "statuses">) {
  const statuses = normalizeTaskStatuses(task.statuses);
  const status = statuses.find((s) => s.id === task.status) ?? statuses[0];

  return {
    statuses,
    status,
  };
}

export const useTaskStatuses = (task: Pick<TaskDataFragment, "status" | "statuses">) => {
  const { statuses, status } = useMemo(() => getTaskStatuses(task), [task]);
  return { statuses, status };
};

export const useFolderStatuses = (folderId?: string | null) => {
  const variables = useMemo(() => {
    return folderId
      ? {
          contextType: TaskContextType.Folder,
          contextId: folderId,
        }
      : {};
  }, [folderId]);

  const taskStatusesData = useQuery(QUERY_TASK_STATUSES, {
    variables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const statuses = useMemo(() => {
    const selectStatuses = taskStatusesData.data?.taskStatuses.isInherited
      ? taskStatusesData.data?.taskStatuses.workspaceStatuses
      : taskStatusesData.data?.taskStatuses.statuses;

    const allStatus = normalizeTaskStatuses(selectStatuses ?? []);

    return {
      inprogress: allStatus.filter((status) => status.id !== DefaultTaskStatusId.CLOSED),
      closed: allStatus.filter((status) => status.id === DefaultTaskStatusId.CLOSED),
    };
  }, [taskStatusesData.data, folderId]);

  return { statuses, loading: taskStatusesData.loading };
};
