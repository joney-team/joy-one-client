"use client";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { WayPoint } from "@/components/way-point";
import { TaskStatusIcon } from "@/modules/tasks/components/task-status-icon";
import type { ModalCreateTaskRef } from "@/modules/tasks/modals/modal-create-task";
import { useTasks } from "@/modules/tasks/tasks-context";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Center, Group, Loader, Skeleton, Stack, Text } from "@mantine/core";
import { IconCaretDownFilled, IconCaretRightFilled, IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { ListTaskRowHead } from "./list-task-row-head";

import { TaskStatus } from "@/graphql/types.graphql";
import { useElementLazyLoad, useWaitElementLazyLoad } from "@/hooks/use-element-lazy-load";
import { nonLoading } from "@/utils/non-loading";
import { GetTasksQueryVariables } from "../../graphql/getTasks.graphql";
import { useTasksQuery } from "../../hooks/use-tasks-query";
import styles from "./list-tasks.module.css";

const ListTaskRow = dynamic(() => import("./list-task-row").then((mod) => mod.ListTaskRow), {
  ssr: false,
  loading: () => <Skeleton height={22} w="100%" radius={0} />,
});

const ModalCreateTask = dynamic(
  () => import("@/modules/tasks/modals/modal-create-task").then((mod) => mod.ModalCreateTask),
  {
    ssr: false,
    loading: nonLoading,
  },
);

interface ListTasksGroupProps {
  status: TaskStatus;
  defaultVisible?: boolean;
  lazyLoadId?: string;
}

const limit = 30;

export const ListTasksGroup: FC<ListTasksGroupProps> = ({
  lazyLoadId,
  defaultVisible = true,
  status,
}) => {
  const modalCreateTaskRef = useRef<ModalCreateTaskRef>(null);
  const { activatedFolder, state } = useTasks();

  const [isReadyToFetch, setIsReadyToFetch] = useState(!lazyLoadId);
  const [isVisible, setIsVisible] = useState(defaultVisible);

  const isClosedTasks = status.id === DefaultTaskStatusId.CLOSED;

  const groupVariables: GetTasksQueryVariables = useMemo(() => {
    return {
      ...state.variables,
      status: status.id,
      folderId: activatedFolder?._id,
      limit,
      parentId: "root",
    };
  }, [status.id, activatedFolder?._id, state.variables]);

  const { getTasks, tasks, loading, loadMore, isCanLoadMore, isLoadingMore, count } = useTasksQuery(
    { variables: groupVariables },
  );

  useEffect(() => {
    if (!isReadyToFetch) return;
    getTasks();
  }, [getTasks, isReadyToFetch]);

  useWaitElementLazyLoad({
    id: lazyLoadId,
    onLoaded: () => setIsReadyToFetch(true),
  });

  const elementLazyLoadId = useElementLazyLoad({
    id: status.id,
    delay: 300,
    isLoaded: !loading,
  });

  return (
    <Stack gap={4} id={elementLazyLoadId}>
      <Group gap={10}>
        <Group gap={0} onClick={() => setIsVisible((s) => !s)}>
          <ActionIcon radius={100} variant="transparent" color="gray" ml={-10}>
            {isVisible ? <IconCaretDownFilled size={16} /> : <IconCaretRightFilled size={16} />}
          </ActionIcon>

          <Button
            size="compact-xs"
            variant="light"
            color={status.color ?? "gray"}
            leftSection={
              <Center mr={-4}>
                <TaskStatusIcon {...status} size={14} />
              </Center>
            }
            tt="uppercase"
          >
            {status.name}
          </Button>
        </Group>

        {!!count && count > 0 && (
          <Text c="gray" fz={12} fw={500}>
            <NumberFormat value={count} />
          </Text>
        )}

        {!isClosedTasks && (
          <Button
            variant="subtle"
            size="compact-xs"
            color="gray"
            leftIcon={IconPlus}
            onClick={() =>
              modalCreateTaskRef.current?.open({
                initial: {
                  status: status.id,
                  folder: activatedFolder,
                  order: (tasks[0]?.order ?? 1) / 2,
                },
              })
            }
          >
            <Trans>Create task</Trans>
          </Button>
        )}
      </Group>

      {isVisible && tasks.length > 0 && (
        <Stack gap={0} w="100%">
          <ListTaskRowHead />

          <Card withBorder shadow="none" p={0} style={{ overflow: "auto" }}>
            <Stack gap={0} miw={0} className={styles.ListTaskRows}>
              {tasks.map((task, index) => (
                <ListTaskRow
                  task={task}
                  key={task._id}
                  groupVariables={groupVariables}
                  lastRow={index === tasks.length - 1}
                  prevTask={tasks[index - 1]}
                  nextTask={tasks[index + 1]}
                  droppableOptions={{
                    inherits: ["status", "parentId", "folderId"],
                  }}
                  nextParentTask={null}
                />
              ))}

              {((loading && !tasks.length) || isLoadingMore) && (
                <Group px={10} py={5}>
                  <Loader type="dots" color="gray" size="xs" />
                </Group>
              )}

              {isCanLoadMore && <WayPoint onReached={loadMore} />}
            </Stack>
          </Card>
        </Stack>
      )}

      <ModalCreateTask ref={modalCreateTaskRef} />
    </Stack>
  );
};
