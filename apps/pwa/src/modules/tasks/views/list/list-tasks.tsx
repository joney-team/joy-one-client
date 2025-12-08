"use client";

import { useTasks } from "@/modules/tasks/tasks-context";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { autoScrollWindowForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { Skeleton, Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import { FC, Fragment, memo, PropsWithChildren, useEffect, useMemo } from "react";
import { TaskMenuActions } from "../../components/tasks-menu-actions";
import { TaskSelectionsProvider } from "../../modules/task-selections/task-selections-provider";
import { useQuery } from "@apollo/client/react";
import QUERY_TASK_STATUSES, {
  type TaskStatusesQuery,
  type TaskStatusesQueryVariables,
} from "../../graphql/queryTaskStatuses.graphql";
import { TaskStatusesContextType } from "@/graphql/enums.graphql";
import { combineTaskStatuses } from "../../task-constants";

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

  useEffect(() => {
    return autoScrollWindowForElements();
  });

  const content = useMemo(() => {
    if (!isReady) return null;

    const statuses = combineTaskStatuses(taskStatusesData.data?.taskStatuses ?? []);
    const dynamicStatuses = statuses.filter(
      (status) => !Object.values(DefaultTaskStatusId).includes(status.id as any)
    );

    return (
      <Fragment>
        <ListTaskGroupByStatuses key={activatedFolder?._id} status={statuses[0]} />

        {dynamicStatuses.map((status) => {
          return (
            <ListTaskGroupByStatuses
              key={status.id}
              status={status}
              hideWhenEmpty
              lazyLoadId={DefaultTaskStatusId.TODO}
            />
          );
        })}

        {state.showClosed && (
          <ListTaskGroupByStatuses
            key={statuses[statuses.length - 1].id}
            status={statuses[statuses.length - 1]}
            showEmptyMsg
            lazyLoadId={DefaultTaskStatusId.TODO}
          />
        )}
      </Fragment>
    );
  }, [activatedFolder, taskStatusesData.data?.taskStatuses, isReady]);

  return (
    <TaskSelectionsProvider>
      <Stack p={16}>
        <TaskMenuActions />
        {content}
        {props.children}
      </Stack>
    </TaskSelectionsProvider>
  );
});
