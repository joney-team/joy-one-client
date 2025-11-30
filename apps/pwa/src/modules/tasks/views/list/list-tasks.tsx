"use client";

import { useTasks } from "@/modules/tasks/tasks-context";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { autoScrollWindowForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { Skeleton, Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import { FC, Fragment, memo, PropsWithChildren, useEffect, useMemo } from "react";
import { TaskMenuActions } from "../../components/tasks-menu-actions";
import { TaskSelectionsProvider } from "../../modules/task-selections/task-selections-provider";

const ListTaskGroupByStatuses = dynamic(
  () => import("./list-task-group-by-statuses").then((mod) => mod.ListTaskGroupByStatuses),
  {
    ssr: false,
    loading: () => <Skeleton height={200} w="100%" />,
  }
);

export const ListTasks: FC<PropsWithChildren> = memo((props) => {
  const { state, activatedFolder, statuses, isReady } = useTasks();

  useEffect(() => {
    return autoScrollWindowForElements();
  });

  const content = useMemo(() => {
    if (!isReady) return null;

    return (
      <Fragment>
        <ListTaskGroupByStatuses
          key={activatedFolder?._id}
          status={DefaultTaskStatusId.TODO}
          folderId={activatedFolder?._id}
        />

        {statuses
          .filter((v) => !v.isDefault)
          .map((status) => (
            <ListTaskGroupByStatuses
              key={activatedFolder?._id + status.id}
              status={status.id}
              hideWhenEmpty
              folderId={activatedFolder?._id}
            />
          ))}

        {state.showClosed && (
          <ListTaskGroupByStatuses
            key={activatedFolder?._id + DefaultTaskStatusId.CLOSED}
            status={DefaultTaskStatusId.CLOSED}
            showEmptyMsg
            folderId={activatedFolder?._id}
          />
        )}
      </Fragment>
    );
  }, [activatedFolder, statuses, isReady]);

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
