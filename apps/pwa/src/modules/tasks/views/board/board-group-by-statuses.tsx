"use client";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { WayPoint } from "@/components/way-point";
import { Task } from "@/graphql/types.graphql";
import { TaskStatusIcon } from "@/modules/tasks/components/task-status-options";
import { ModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { OnTaskSatusesModal } from "@/modules/tasks/task-status-modal";
import { useTasks } from "@/modules/tasks/tasks-context";
import { renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { useLazyQuery } from "@apollo/client/react";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Skeleton, Stack, Text, Tooltip, alpha } from "@mantine/core";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { UpdateTaskContext, useUpdateTasks } from "../../hooks/use-update-tasks";
import QUERY_TASKS, {
  type TasksQuery,
  type TasksQueryVariables,
} from "../../queries/queryTasks.graphql";

const BoardTaskCard = dynamic(() => import("./board-task-card").then((res) => res.BoardTaskCard), {
  ssr: false,
  loading: () => <Skeleton mih={220} height={220} />,
});

interface BoardGroupByStatusesProps {
  statusId: string;
}

const wrapperPadding = 8;
const wrapperRadius = 8;

export const BoardGroupByStatuses: FC<BoardGroupByStatusesProps> = (props) => {
  const workspace = useWorkspace();
  const color = useColor();
  const droppableRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { updateTasks } = useUpdateTasks();

  const { activatedFolder, state } = useTasks();

  const isClosedTasks = props.statusId === DefaultTaskStatusId.CLOSED;
  const isTodoStatus = props.statusId === DefaultTaskStatusId.TODO;

  const groupVariables: TasksQueryVariables = useMemo(() => {
    return {
      ...state.variables,
      status: props.statusId,
      folderId: activatedFolder?._id,
      parentId: "root",
    };
  }, [props.statusId, activatedFolder?._id, state]);

  const [getTasks, { data, fetchMore, loading }] = useLazyQuery<TasksQuery, TasksQueryVariables>(
    QUERY_TASKS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  useEffect(() => {
    getTasks({ variables: groupVariables });
  }, [activatedFolder?._id, groupVariables]);

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

  const tasks = Array.from(data?.tasks.data ?? []).sort((a, b) => a.order - b.order);

  const isCanFetchMore = data && data.tasks.data.length < data.tasks.count;

  const status =
    workspace.settings.taskStatuses.find((s) => s.id === props.statusId) ||
    workspace.settings.taskStatuses[0];

  const statusStyle = renderTaskStatusStyle(props.statusId, workspace.settings.taskStatuses);

  useEffect(() => {
    if (!droppableRef.current || !scrollAreaRef.current) return;

    return combine(
      dropTargetForElements({
        getData: () => ({
          status: props.statusId,
        }),
        element: droppableRef.current,
        onDragEnter: () => setIsOver(true),
        onDragLeave: () => setIsOver(false),
        onDrop: ({ source, location }) => {
          if (
            location.current.dropTargets.length === 1 &&
            location.current.dropTargets[0].data.status === props.statusId
          ) {
            const sourceTask = source.data.task as Task;

            const context: UpdateTaskContext = {
              fromGroupVariables: source.data.groupVariables as TasksQueryVariables,
              toGroupVariables: groupVariables,
            };

            updateTasks({ _id: sourceTask._id, status: props.statusId, context });
          }
        },
      }),
      autoScrollForElements({
        element: scrollAreaRef.current,
      })
    );
  }, [props.statusId, groupVariables]);

  return (
    <ModalCreateTask>
      {(openCreateTask) => {
        const handleCreateTask = () => {
          openCreateTask({
            initial: {
              status: status.id,
              folder: activatedFolder,
              order: (tasks[0]?.order ?? 1) / 2,
            },
          });
        };

        return (
          <Stack
            ref={droppableRef}
            w={300}
            gap={0}
            bg={alpha(color(statusStyle.color), isOver ? 0.1 : 0.05)}
            pb={5}
            style={{ borderRadius: wrapperRadius }}
            mih={0}
          >
            <Group
              p={wrapperPadding}
              pb={wrapperPadding / 2}
              gap={8}
              align="start"
              justify="space-between"
              pos="sticky"
              top={0}
            >
              <Group gap={8}>
                <Button
                  key={status.id}
                  size="compact-sm"
                  variant={!isTodoStatus ? "filled" : "light"}
                  color={statusStyle.color}
                  leftSection={
                    <TaskStatusIcon
                      {...status}
                      white={status.id !== DefaultTaskStatusId.TODO}
                      size={16}
                      mr={-4}
                    />
                  }
                  tt="uppercase"
                  fz={10}
                  fw={800}
                >
                  {statusStyle.name}
                </Button>

                {data && data?.tasks.count > 0 && (
                  <Text c="gray" fz={10} fw={500}>
                    <NumberFormat value={data?.tasks.count} />
                  </Text>
                )}
              </Group>

              {(workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS) ||
                !isClosedTasks) && (
                <Group justify="end" gap={0}>
                  {workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS) && (
                    <Tooltip label={<Trans>Update task status</Trans>}>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        color="gray"
                        onClick={() => OnTaskSatusesModal()}
                      >
                        <IconPencil size={16} strokeWidth={1.6} />
                      </ActionIcon>
                    </Tooltip>
                  )}

                  {!isClosedTasks && (
                    <ActionIcon variant="subtle" size="sm" color="gray" onClick={handleCreateTask}>
                      <IconPlus size={16} strokeWidth={1.6} />
                    </ActionIcon>
                  )}
                </Group>
              )}
            </Group>

            <Stack
              flex={1}
              gap={8}
              mih={0}
              ref={scrollAreaRef}
              style={{
                overflow: "auto",
                padding: wrapperPadding,
              }}
            >
              {tasks.length > 0 &&
                tasks.map((task, index) => (
                  <BoardTaskCard
                    key={task._id}
                    task={task}
                    prevTask={tasks[index - 1]}
                    nextTask={tasks[index + 1]}
                    scrollContainerRef={scrollAreaRef.current}
                    groupVariables={groupVariables}
                  />
                ))}

              {((loading && !data) || isFetchingMore) && <Skeleton height={200} />}

              <WayPoint
                scrollContainerRef={scrollAreaRef.current}
                enabled={isCanFetchMore}
                onReached={onFetchMore}
              />

              {!isClosedTasks && (
                <Group>
                  <Button
                    color="gray"
                    size="compact-sm"
                    variant="subtle"
                    leftIcon={IconPlus}
                    onClick={handleCreateTask}
                  >
                    <Trans>Create task</Trans>
                  </Button>
                </Group>
              )}
            </Stack>
          </Stack>
        );
      }}
    </ModalCreateTask>
  );
};
