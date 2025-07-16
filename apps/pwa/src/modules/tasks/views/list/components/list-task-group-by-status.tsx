import { ProgressCircle } from "@/components/progress-circle";
import { num } from "@/modules/lang/lang-service";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { useTasks } from "@/modules/tasks/tasks-context";
import { renderTaskStatus } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ActionIcon, alpha, Box, Group, Text } from "@mantine/core";
import { IconCaretDownFilled, IconCaretRightFilled, IconPlus } from "@tabler/icons-react";
import { useState, type FC } from "react";
import { useListTaskView } from "../list-task-view-context";
import { ListTaskRow } from "./list-task-row";

interface ListTaskGroupByStatusProps {
  statusId: string;
  tagFolderId?: string;
}

export const ListTaskGroupByStatus: FC<ListTaskGroupByStatusProps> = (props) => {
  const { open } = useTasks();

  const [isCollapsed, setIsCollapsed] = useState(props.statusId === DefaultTaskStatusId.CLOSED);
  const { tasks, selectedTaskIds, toggleSelectTask } = useListTaskView();
  const workspace = useWorkspace();
  const status = renderTaskStatus(props.statusId, workspace.settings.taskStatuses);
  const matchedTasks = tasks.filter((v) => v.status === props.statusId);

  const color = useColor();
  const dividerColor = color("gray.3");

  const { setNodeRef, isOver } = useDroppable({ id: props.statusId });

  return (
    <SortableContext
      id={props.statusId}
      items={matchedTasks.map((v) => v._id)}
      strategy={verticalListSortingStrategy}
    >
      <Group
        ref={setNodeRef}
        justify="space-between"
        p={8}
        bg={alpha(color(status.color), isOver ? 0.1 : 0.05)}
        w="100%"
        pos="relative"
      >
        <Group gap={8}>
          <ActionIcon
            radius={100}
            variant="subtle"
            color="gray"
            onClick={() => setIsCollapsed((s) => !s)}
          >
            {!isCollapsed ? <IconCaretDownFilled size={16} /> : <IconCaretRightFilled size={16} />}
          </ActionIcon>

          <ProgressCircle percent={status.progress * 100} color={color(status.color)} />

          <Text fz={14} fw={500}>
            {status.name}
          </Text>

          {matchedTasks.length > 0 && (
            <Text fz={12} c="gray">
              {num(matchedTasks.length)}
            </Text>
          )}
        </Group>

        <Group justify="end">
          <ActionIcon
            variant="subtle"
            color="dark"
            onClick={() =>
              OnModalCreateTask({ tagFolderId: props.tagFolderId, status: props.statusId })
            }
          >
            <IconPlus strokeWidth={1.5} size={16} />
          </ActionIcon>
        </Group>

        {status.index !== 0 && (
          <Box
            pos="absolute"
            top={-0.5}
            left={0}
            right={0}
            bg={dividerColor}
            style={{
              width: "100%",
              height: "1px",
            }}
          />
        )}

        {status.progress !== 1 && (
          <Box
            pos="absolute"
            bottom={-0.5}
            left={0}
            right={0}
            bg={dividerColor}
            style={{
              width: "100%",
              height: "1px",
            }}
          />
        )}
      </Group>

      {!isCollapsed &&
        matchedTasks.map((task) => {
          return (
            <ListTaskRow
              task={task}
              key={task._id}
              isSelected={selectedTaskIds.includes(task._id)}
              onToggleSelect={(shiftKey) => toggleSelectTask(task._id, shiftKey)}
              onOpen={() => open(task)}
            />
          );
        })}
    </SortableContext>
  );
};
