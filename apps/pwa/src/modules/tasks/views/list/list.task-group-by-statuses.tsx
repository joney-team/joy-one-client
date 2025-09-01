import { Renderer } from "@/components/renderer";
import { TaskStatusIcon } from "@/modules/tasks/components/task-status-options";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { num, t } from "@/modules/lang/lang-service";
import { onTasksUpdated } from "@/modules/tasks/hooks/use-task";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getTasks, renderTaskStatusStyle, syncTasks } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useList } from "@/components/list/use-list";
import { ActionIcon, Button, Card, Group, Stack, Text, em } from "@mantine/core";
import { IconCaretDownFilled, IconCaretRightFilled, IconPlus } from "@tabler/icons-react";
import { FC, useState } from "react";
import { ListTaskRow } from "./list.task-row";
import { ListTaskRowHead } from "./list.task-row-head";
import { ListTaskStatusDropper } from "./list.task-status-dropper";

interface ListTaskGroupByStatusesProps {
  status: string;
  defaultVisible?: boolean;
  hideWhenEmpty?: boolean;
  showEmptyMsg?: boolean;
  tagFolderId?: string;
}

export const ListTaskGroupByStatuses: FC<ListTaskGroupByStatusesProps> = (props) => {
  const workspace = useWorkspace();
  const ctx = useTasks();

  const [isVisible, setIsVisible] = useState(
    typeof props.defaultVisible === "boolean" ? props.defaultVisible : true
  );

  const tagFolderId = props.tagFolderId || "root";
  const isClosedTasks = props.status === DefaultTaskStatusId.CLOSED;
  const listId = `tasks-group-by-statues-${props.status}-${tagFolderId}-${JSON.stringify(
    ctx.state
  )}`;

  const taskList = useList({
    id: listId,
    fetch: (q) =>
      getTasks({
        ...q,
        ...ctx.state,
        status: props.status,
        tagFolderId,
        parentId: "root",
        getAll: true,
      }),
  });

  const status =
    workspace.settings.taskStatuses.find((s) => s.id === props.status) ||
    workspace.settings.taskStatuses[0];
  const statusStyle = renderTaskStatusStyle(props.status, workspace.settings.taskStatuses);
  const tasks = taskList.data.sort((a, b) => a.order - b.order);

  onTasksUpdated(
    (updatedTasks) => {
      const synced = syncTasks({
        prevTasks: tasks,
        updatedTasks,
        related: (task) =>
          !!!task.parentId &&
          task.status === props.status &&
          (task.tagFolderId || null) === (props.tagFolderId || null),
      });

      if (synced.isChanged) {
        taskList.setData(synced.changed, taskList.count + synced.balance);
      }
    },
    [tasks, listId]
  );

  if (props.hideWhenEmpty && taskList.count === 0) return null;

  return (
    <Stack gap={0}>
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
              <TaskStatusIcon
                {...status}
                white={isClosedTasks || !status.isDefault}
                size={16}
                mr={-3}
              />
            }
            tt="uppercase"
            fz={em(12)}
          >
            {statusStyle.name}
          </Button>
        </Group>

        {taskList.isHasData && (
          <Text c="gray" fz={em(12)} fw={500}>
            {num(taskList.count)}
          </Text>
        )}

        {!isClosedTasks && (
          <Button
            variant="subtle"
            size="compact-xs"
            color="gray"
            leftSection={<IconPlus size={16} strokeWidth={2} style={{ marginRight: -6 }} />}
            onClick={() =>
              OnModalCreateTask({
                status: props.status,
                tagFolderId: props.tagFolderId,
              })
            }
          >
            {t("create")} {t("task")}
          </Button>
        )}
      </Group>

      <Renderer visible={isVisible}>
        <Stack gap={16} py={10} pl={16} w="100%">
          <Renderer visible={taskList.isHasData}>
            <Stack gap={5} w="100%">
              <ListTaskRowHead />

              <Card withBorder shadow="none" p={0}>
                {tasks.map((task, index) => (
                  <ListTaskRow
                    id={task._id}
                    key={task._id + props.tagFolderId || "general"}
                    showDivider={index < tasks.length - 1}
                    indexType={
                      index === tasks.length - 1 ? "last" : index === 0 ? "first" : undefined
                    }
                    nextId={tasks[index + 1]?._id}
                    prevId={tasks[index - 1]?._id}
                  />
                ))}
              </Card>
            </Stack>
          </Renderer>

          <ListTaskStatusDropper
            tagFolderId={props.tagFolderId}
            status={props.status}
            enabled={taskList.isEmpty}
          />
        </Stack>
      </Renderer>
    </Stack>
  );
};
