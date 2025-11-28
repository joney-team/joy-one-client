"use client";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { useList } from "@/components/list/use-list";
import { Renderer } from "@/components/renderer";
import { TaskStatusIcon } from "@/modules/tasks/components/task-status-options";
import { onTasksUpdated } from "@/modules/tasks/hooks/use-task";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { OnTaskSatusesModal } from "@/modules/tasks/task-status-modal";
import { useTasks } from "@/modules/tasks/tasks-context";
import {
  getTasks,
  renderTaskStatusStyle,
  syncTasks,
  updateTasks,
} from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskEntity } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Stack, Text, Tooltip, alpha, em } from "@mantine/core";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { FC, useEffect, useRef, useState } from "react";
import { BoardTaskCard } from "./board-task-card";

interface BoardGroupByStatusesProps {
  statusId: string;
}

const wrapperPadding = 8;
const wrapperRadius = 8;

export const BoardGroupByStatuses: FC<BoardGroupByStatusesProps> = (props) => {
  const workspace = useWorkspace();
  const color = useColor();
  const droppableRef = useRef<HTMLDivElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

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
        onDrop: (args) => {
          if (
            args.location.current.dropTargets.length === 1 &&
            args.location.current.dropTargets[0].data.status === props.statusId
          ) {
            const task = args.source.data.task as TaskEntity;
            updateTasks([{ _id: task._id, status: props.statusId }]);
          }
        },
      }),
      autoScrollForElements({
        element: scrollAreaRef.current,
      })
    );
  }, [props.statusId]);

  const { tagFolder } = useTasks();

  const isClosedTasks = props.statusId === DefaultTaskStatusId.CLOSED;
  const isTodoStatus = props.statusId === DefaultTaskStatusId.TODO;
  const listId = `tasks-${props.statusId}-${tagFolder?._id || "all"}`;

  const taskList = useList({
    id: listId,
    fetch: (q) =>
      getTasks({
        ...q,
        status: props.statusId,
        tagFolderId: tagFolder?._id,
        parentId: "root",
        getAll: true,
      }),
  });

  const tasks = taskList.data.sort((a, b) => a.order - b.order);

  onTasksUpdated(
    (updatedTasks) => {
      const synced = syncTasks({
        prevTasks: tasks,
        updatedTasks,
        related: (task) => !!!task.parentId && task.status === props.statusId,
      });

      if (synced.isChanged) {
        taskList.setData(synced.changed, taskList.count + synced.balance);
      }
    },
    [tasks, listId]
  );

  const status =
    workspace.settings.taskStatuses.find((s) => s.id === props.statusId) ||
    workspace.settings.taskStatuses[0];
  const statusStyle = renderTaskStatusStyle(props.statusId, workspace.settings.taskStatuses);

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
        gap={10}
        align="start"
        justify="space-between"
        pos="sticky"
        top={0}
      >
        <Group gap={10}>
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
                mr={-8}
              />
            }
            tt="uppercase"
            fz={10}
            pr={10}
            fw={800}
          >
            {statusStyle.name}
          </Button>

          <Text c="gray" fz={em(12)} fw={500}>
            <NumberFormat value={taskList.count} />
          </Text>
        </Group>

        <Group justify="end" gap={0}>
          <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}>
            <Tooltip label={t`Update task status`}>
              <ActionIcon
                variant="subtle"
                size="sm"
                color="gray"
                onClick={() => OnTaskSatusesModal()}
              >
                <IconPencil size={16} strokeWidth={1.5} />
              </ActionIcon>
            </Tooltip>
          </Renderer>

          <Renderer visible={!isClosedTasks}>
            <ActionIcon
              variant="subtle"
              size="sm"
              color="gray"
              onClick={() => OnModalCreateTask({ status: status.id })}
            >
              <IconPlus size={16} strokeWidth={1.5} />
            </ActionIcon>
          </Renderer>
        </Group>
      </Group>

      <Stack
        flex={1}
        gap={8}
        mih={0}
        miw={0}
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
              id={task._id}
              prevTask={tasks[index - 1]}
              nextTask={tasks[index + 1]}
            />
          ))}

        {!isClosedTasks && (
          <Group>
            <Button
              color="gray"
              size="compact-sm"
              variant="subtle"
              leftIcon={IconPlus}
              onClick={() => OnModalCreateTask({ status: status.id })}
            >
              <Trans>Create task</Trans>
            </Button>
          </Group>
        )}
      </Stack>
    </Stack>
  );
};
