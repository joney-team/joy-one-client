"use client";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { WayPoint } from "@/components/way-point";
import { TaskStatusIcon } from "@/modules/tasks/components/task-status-options";
import { ModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import QUERY_TASKS, {
  type TasksQuery,
  type TasksQueryVariables,
} from "@/modules/tasks/queries/queryTasks.graphql";
import { useTasks } from "@/modules/tasks/tasks-context";
import { renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { useLazyQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Group, Loader, Skeleton, Stack, Text } from "@mantine/core";
import { IconCaretDownFilled, IconCaretRightFilled, IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, useEffect, useMemo, useState } from "react";
import { ListTaskRowHead } from "./list-task-row-head";

import { useElementLazyLoad, useWaitElementLazyLoad } from "@/hooks/use-element-lazy-load";
import styles from "./list-tasks.module.css";

const ListTaskRow = dynamic(() => import("./list-task-row").then((mod) => mod.ListTaskRow), {
  ssr: false,
  loading: () => <Skeleton height={22} w="100%" radius={0} />,
});

interface ListTaskGroupByStatusesProps {
  status: string;
  defaultVisible?: boolean;
  hideWhenEmpty?: boolean;
  showEmptyMsg?: boolean;
  lazyLoadId?: string;
}

export const ListTaskGroupByStatuses: FC<ListTaskGroupByStatusesProps> = ({
  lazyLoadId,
  ...props
}) => {
  const workspace = useWorkspace();
  const { activatedFolder, href, state } = useTasks();

  const [isReadyToFetch, setIsReadyToFetch] = useState(!lazyLoadId);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [isVisible, setIsVisible] = useState(
    typeof props.defaultVisible === "boolean" ? props.defaultVisible : true
  );

  const isClosedTasks = props.status === DefaultTaskStatusId.CLOSED;

  const groupVariables: TasksQueryVariables = useMemo(() => {
    return {
      ...state.variables,
      status: props.status,
      folderId: activatedFolder?._id,
      limit: 15,
      parentId: "root",
    };
  }, [props.status, activatedFolder?._id, state]);

  const [getTasks, { loading, data, fetchMore }] = useLazyQuery<TasksQuery, TasksQueryVariables>(
    QUERY_TASKS,
    {
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    if (isReadyToFetch) {
      getTasks({ variables: groupVariables });
    }
  }, [groupVariables, isReadyToFetch]);

  const onFetchMore = async () => {
    setIsFetchingMore(true);
    await fetchMore({
      variables: {
        ...groupVariables,
        offset: data?.tasks.data.length || 0,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          tasks: {
            ...prev.tasks,
            count: fetchMoreResult.tasks.count,
            data: [
              ...prev.tasks.data,
              ...fetchMoreResult.tasks.data.filter(
                (task) => !prev.tasks.data.some((t) => t._id === task._id)
              ),
            ],
          },
        };
      },
    })
      .catch(onError)
      .finally(() => setIsFetchingMore(false));
  };

  const isCanFetchMore = data && data.tasks.data.length < data.tasks.count;

  const status =
    workspace.settings.taskStatuses.find((s) => s.id === props.status) ||
    workspace.settings.taskStatuses[0];

  const statusStyle = renderTaskStatusStyle(props.status, workspace.settings.taskStatuses);

  const tasks = useMemo(() => {
    return Array.from(data?.tasks.data ?? []).sort((a, b) => a.order - b.order);
  }, [data]);

  useWaitElementLazyLoad({
    id: lazyLoadId,
    onLoaded: () => setIsReadyToFetch(true),
  });

  const elementLazyLoadId = useElementLazyLoad({
    id: props.status,
    delay: 300,
    isLoaded: !!data,
  });

  if (props.hideWhenEmpty && (data?.tasks.count ?? 0) === 0) return null;

  return (
    <Stack gap={4} id={elementLazyLoadId}>
      <Group gap={10}>
        <Group gap={0} onClick={() => setIsVisible((s) => !s)}>
          <ActionIcon radius={100} variant="transparent" color="gray" ml={-10}>
            {isVisible ? <IconCaretDownFilled size={16} /> : <IconCaretRightFilled size={16} />}
          </ActionIcon>

          <Button
            size="compact-sm"
            variant={isClosedTasks || !status.isDefault ? "filled" : "light"}
            color={statusStyle.color}
            leftSection={
              <TaskStatusIcon {...status} white={isClosedTasks || !status.isDefault} size={16} />
            }
            tt="uppercase"
          >
            {statusStyle.name}
          </Button>
        </Group>

        {!!data?.tasks.count && data.tasks.count > 0 && (
          <Text c="gray" fz={12} fw={500}>
            <NumberFormat value={data.tasks.count} />
          </Text>
        )}

        {!isClosedTasks && (
          <ModalCreateTask>
            {(open) => (
              <Button
                variant="subtle"
                size="compact-xs"
                color="gray"
                leftIcon={IconPlus}
                fw={400}
                onClick={() =>
                  open({
                    initial: {
                      status: props.status,
                      folder: activatedFolder,
                      order: (tasks[0]?.order ?? 1) / 2,
                    },
                  })
                }
              >
                <Trans>Create task</Trans>
              </Button>
            )}
          </ModalCreateTask>
        )}
      </Group>

      {isVisible && !!data?.tasks.count && data.tasks.count > 0 && (
        <Stack gap={0} w="100%">
          <ListTaskRowHead />

          <Card withBorder shadow="none" p={0} style={{ overflow: "auto" }}>
            <Stack gap={0} miw={0} className={styles.ListTaskRows}>
              {tasks.map((task, index) => (
                <ListTaskRow
                  task={task}
                  key={task._id}
                  href={href(task)}
                  groupVariables={groupVariables}
                  lastRow={index === tasks.length - 1}
                  prevTask={tasks[index - 1]}
                  nextTask={tasks[index + 1]}
                  droppableOptions={{
                    inherits: ["status", "parentId", "folderId"],
                  }}
                />
              ))}

              {((loading && !data) || isFetchingMore) && (
                <Group px={10} py={5}>
                  <Loader type="dots" color="gray" size="xs" />
                </Group>
              )}

              {isCanFetchMore && <WayPoint enabled={isCanFetchMore} onReached={onFetchMore} />}
            </Stack>
          </Card>
        </Stack>
      )}
    </Stack>
  );
};
