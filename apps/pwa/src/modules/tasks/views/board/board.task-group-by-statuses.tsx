"use client";

import { Button } from "@/components/buttons/button";
import { useList } from "@/components/list/use-list";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { num } from "@/modules/lang/lang-service";
import { TaskStatusIcon } from "@/modules/tasks/components/task-status-options";
import { onTasksUpdated } from "@/modules/tasks/hooks/use-task";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { OnTaskSatusesModal } from "@/modules/tasks/task-status-modal";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getTasks, renderTaskStatusStyle, syncTasks } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Group,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  alpha,
  em,
  useMantineTheme,
} from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { useDndTasks } from "../../tasks-dnd-provider";
import { BoardTaskCard, ChangeStatusDrop } from "./board.task-card";
import { viewBoardConfig } from "./config";

interface BoardTaskGroupByStatusesProps {
  statusId: string;
}

export const BoardTaskGroupByStatuses: FC<BoardTaskGroupByStatusesProps> = (props) => {
  const workspace = useWorkspace();
  const viewport = useLayout();
  const theme = useMantineTheme();
  const color = useColor();

  const { tagFolder } = useTasks();
  const dndTasks = useDndTasks();

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
        getAll: !isClosedTasks,
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

  const wrapperSize = useElementSize();
  const headSize = 34;
  const wrapperPadding = 8;
  const bodyMaxHeight = wrapperSize.height - headSize - wrapperPadding * 2;

  return (
    <Stack h="100%" w={viewBoardConfig.colWidth} ref={wrapperSize.ref}>
      <Stack
        gap={0}
        w="100%"
        bg={alpha(color(statusStyle.color), 0.05)}
        pb={5}
        style={{ borderRadius: theme.defaultRadius }}
      >
        <Group
          p={wrapperPadding}
          gap={10}
          align="start"
          justify="space-between"
          h={headSize}
          mih={headSize}
          mah={headSize}
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
              {num(taskList.count)}
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

        <Stack gap={16} flex={1} pb={wrapperPadding}>
          <ScrollArea
            mah={bodyMaxHeight}
            type={viewport.view !== "desktop" ? "auto" : "always"}
            scrollbarSize={viewport.view === "desktop" ? undefined : 20}
            offsetScrollbars
            scrollHideDelay={100}
            styles={{
              scrollbar: {
                borderRadius: 15,
                backgroundColor: "transparent",
              },
              thumb: {
                backgroundColor: "#00000015",
              },
            }}
            style={{
              borderBottomRadius: theme.defaultRadius,
              borderBottomRightRadius: theme.defaultRadius,
            }}
            pl={wrapperPadding}
            pr={viewport.view === "desktop" ? wrapperPadding / 2 : 5}
            pt={wrapperPadding}
          >
            <Stack gap={16}>
              <Renderer visible={tasks.length > 0}>
                <Stack gap={16} pb={3}>
                  {tasks.map((task, index) => (
                    <BoardTaskCard
                      key={task._id}
                      id={task._id}
                      indexType={
                        index === tasks.length - 1 ? "last" : index === 0 ? "first" : undefined
                      }
                      nextId={tasks[index + 1]?._id}
                      prevId={tasks[index - 1]?._id}
                    />
                  ))}
                </Stack>
              </Renderer>

              <ChangeStatusDrop
                visible={!!dndTasks.draggingTaskId && tasks.length === 0}
                statusId={status.id}
              />

              <Renderer visible={!isClosedTasks && !!!dndTasks.draggingTaskId}>
                <Group>
                  <Button
                    color="gray"
                    size="compact-sm"
                    fz={em(14)}
                    variant="subtle"
                    leftIcon={IconPlus}
                    iconSize={16}
                    iconSpacing={-6}
                    onClick={() => OnModalCreateTask({ status: status.id })}
                  >
                    <Trans>Create task</Trans>
                  </Button>
                </Group>
              </Renderer>
            </Stack>
          </ScrollArea>
        </Stack>
      </Stack>
    </Stack>
  );
};
