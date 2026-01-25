"use client";

import { useTasks } from "@/modules/tasks/tasks-context";
import { autoScrollWindowForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { Skeleton, Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import { FC, Fragment, memo, PropsWithChildren, useEffect, useMemo } from "react";
import { useFolderStatuses } from "../../hooks/use-task-statuses";
import { TaskSelectionsProvider } from "../../components/task-selections/task-selections-provider";

const ListTasksGroup = dynamic(
  () => import("./list-tasks-group").then((mod) => mod.ListTasksGroup),
  {
    ssr: false,
    loading: () => <Skeleton height={200} w="100%" />,
  }
);

export const ListTasks: FC<PropsWithChildren> = memo((props) => {
  const { state, activatedFolder, isReady } = useTasks();

  const { statuses, loading } = useFolderStatuses(activatedFolder?._id);

  useEffect(() => {
    return autoScrollWindowForElements();
  });

  const listTasksGroup = useMemo(() => {
    if (!isReady || loading) return null;

    return (
      <Fragment>
        {statuses.inprogress.map((status, statusIndex) => {
          return (
            <ListTasksGroup
              key={status.id + statusIndex}
              status={status}
              lazyLoadId={statuses.inprogress[0].id}
            />
          );
        })}

        {state.showClosed &&
          statuses.closed.map((status, statusIndex) => {
            return (
              <ListTasksGroup
                key={status.id + statusIndex}
                status={status}
                lazyLoadId={statuses.closed[0].id}
              />
            );
          })}
      </Fragment>
    );
  }, [isReady, loading, state.showClosed]);

  return (
    <TaskSelectionsProvider>
      <Stack p="sm">
        {listTasksGroup}
        {props.children}
      </Stack>
    </TaskSelectionsProvider>
  );
});
