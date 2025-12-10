"use client";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { WayPoint } from "@/components/way-point";
import { Task, TaskStatus } from "@/graphql/types.graphql";
import { TaskStatusIcon } from "@/modules/tasks/components/task-status-options";
import { ModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { OnTaskSatusesModal } from "@/modules/tasks/task-status-modal";
import { useTasks } from "@/modules/tasks/tasks-context";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Skeleton, Stack, Text, Tooltip, alpha } from "@mantine/core";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { type TasksQueryVariables } from "../../graphql/queryTasks.graphql";
import { useTasksQuery } from "../../hooks/use-tasks-query";
import { UpdateTaskContext, useUpdateTasks } from "../../hooks/use-update-tasks";

const BoardTaskCard = dynamic(() => import("./board-task-card").then((res) => res.BoardTaskCard), {
  ssr: false,
  loading: () => <Skeleton mih={220} height={220} miw="100%" />,
});

interface BoardGroupByStatusesProps {
  status: TaskStatus;
}

const wrapperPadding = 8;
const wrapperRadius = 8;
const limit = 5;

export const BoardGroupByStatuses: FC<BoardGroupByStatusesProps> = (props) => {
  const workspace = useWorkspace();
  const color = useColor();
  const droppableRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  const { updateTasks } = useUpdateTasks();

  const { activatedFolder, state } = useTasks();

  const isClosedTasks = props.status.id === DefaultTaskStatusId.CLOSED;
  const isTodoStatus = props.status.id === DefaultTaskStatusId.TODO;

  const groupVariables: TasksQueryVariables = useMemo(() => {
    return {
      ...state.variables,
      status: props.status.id,
      folderId: activatedFolder?._id,
      limit,
      parentId: "root",
    };
  }, [props.status.id, activatedFolder?._id, state]);

  const { getTasks, tasks, loading, loadMore, isCanLoadMore, isLoadingMore, count } = useTasksQuery(
    { variables: groupVariables }
  );

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  useEffect(() => {
    if (!droppableRef.current || !scrollAreaRef.current) return;

    return combine(
      dropTargetForElements({
        getData: () => ({
          status: props.status.id,
        }),
        element: droppableRef.current,
        onDragEnter: () => setIsOver(true),
        onDragLeave: () => setIsOver(false),
        onDrop: ({ source, location }) => {
          if (
            location.current.dropTargets.length === 1 &&
            location.current.dropTargets[0].data.status === props.status.id
          ) {
            const sourceTask = source.data.task as Task;

            const context: UpdateTaskContext = {
              fromGroupVariables: source.data.groupVariables as TasksQueryVariables,
              toGroupVariables: groupVariables,
            };

            updateTasks({ _id: sourceTask._id, status: props.status.id, context });
          }
        },
      }),
      autoScrollForElements({
        element: scrollAreaRef.current,
      })
    );
  }, [props.status.id, groupVariables]);

  return (
    <ModalCreateTask>
      {(modalCreateTask) => {
        const handleCreateTask = () => {
          modalCreateTask.open({
            initial: {
              status: props.status.id,
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
            bg={alpha(color(props.status.color ?? "gray"), isOver ? 0.1 : 0.05)}
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
                  key={props.status.id}
                  size="compact-sm"
                  variant={!isTodoStatus ? "filled" : "light"}
                  color={props.status.color ?? "gray"}
                  leftSection={
                    <TaskStatusIcon
                      {...props.status}
                      white={props.status.id !== DefaultTaskStatusId.TODO}
                      size={16}
                      mr={-4}
                    />
                  }
                  tt="uppercase"
                  fz={10}
                  fw={800}
                >
                  {props.status.name}
                </Button>

                {count && count > 0 && (
                  <Text c="gray" fz={10} fw={500}>
                    <NumberFormat value={count} />
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
                        component="div"
                        onClick={() => OnTaskSatusesModal()}
                      >
                        <IconPencil size={16} strokeWidth={1.6} />
                      </ActionIcon>
                    </Tooltip>
                  )}

                  {!isClosedTasks && (
                    <ActionIcon
                      component="div"
                      variant="subtle"
                      size="sm"
                      color="gray"
                      onClick={handleCreateTask}
                    >
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

              {(loading || isLoadingMore) && <Skeleton mih={220} miw="100%" />}

              {isCanLoadMore && (
                <WayPoint
                  scrollContainerRef={scrollAreaRef.current}
                  enabled={isCanLoadMore}
                  onReached={loadMore}
                />
              )}

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
