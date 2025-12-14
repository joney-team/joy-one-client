"use client";

import { TaskStatusesContextType } from "@/graphql/enums.graphql";
import { useTasks } from "@/modules/tasks/tasks-context";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { useQuery } from "@apollo/client/react";
import { autoScrollWindowForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { Skeleton, Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import { FC, Fragment, memo, PropsWithChildren, useEffect, useMemo } from "react";
import QUERY_TASK_STATUSES, {
  type TaskStatusesQuery,
  type TaskStatusesQueryVariables,
} from "../../graphql/queryTaskStatuses.graphql";
import { TaskSelectionsProvider } from "../../modules/task-selections/task-selections-provider";
import { normalizeTaskStatuses } from "../../task-constants";

const ListTaskGroupByStatuses = dynamic(
  () => import("./list-task-group-by-statuses").then((mod) => mod.ListTaskGroupByStatuses),
  {
    ssr: false,
    loading: () => <Skeleton height={200} w="100%" />,
  }
);

export const ListTasks: FC<PropsWithChildren> = memo((props) => {
  const { state, activatedFolder, isReady } = useTasks();

  const taskStatusesData = useQuery<TaskStatusesQuery, TaskStatusesQueryVariables>(
    QUERY_TASK_STATUSES,
    {
      variables: activatedFolder
        ? {
            contextType: TaskStatusesContextType.Folder,
            contextId: activatedFolder?._id,
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

  useEffect(() => {
    return autoScrollWindowForElements();
  });

  return (
    <TaskSelectionsProvider>
      <Stack p="sm">
        {isReady && (
          <Fragment>
            {statuses.inprogress.map((status, statusIndex) => {
              return (
                <ListTaskGroupByStatuses
                  key={status.id + statusIndex}
                  status={status}
                  lazyLoadId={statuses.inprogress[0].id}
                />
              );
            })}

            {state.showClosed &&
              statuses.closed.map((status, statusIndex) => {
                return (
                  <ListTaskGroupByStatuses
                    key={status.id + statusIndex}
                    status={status}
                    lazyLoadId={statuses.closed[0].id}
                  />
                );
              })}
          </Fragment>
        )}

        {props.children}
      </Stack>
    </TaskSelectionsProvider>
  );
});
