import { TaskEntity } from "@/modules/tasks/tasks-types";
import { ActionIcon, Group, Text } from "@mantine/core";
import { memo, type FC } from "react";

import { useColor } from "@/modules/theme/use-color";
import { classNames } from "@/utils/ui.utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconSquareCheckFilled, IconSquareDashed } from "@tabler/icons-react";
import { useListTaskView } from "../list-task-view-context";
import { ListTaskAssignees } from "./list-task-assignees";
import styles from "./list-task-row.module.css";
import { ListTaskStatus } from "./list-task-status";
import { useInViewport } from "@mantine/hooks";

interface ListTaskRowProps {
  task: TaskEntity;
  isSelected: boolean;
  onToggleSelect: (shiftKey?: boolean) => void;
  onOpen: () => void;
}

export const ListTaskRow: FC<ListTaskRowProps> = memo((props) => {
  const color = useColor();
  const { ref, inViewport } = useInViewport();

  const { draggingId } = useListTaskView();
  const isReadOnly = !!draggingId;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.task._id,
    disabled: !inViewport,
    data: {
      _id: props.task._id,
      status: props.task.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Group ref={ref} h={50} w="100%">
      {inViewport && (
        <Group
          align="center"
          px={8}
          gap={8}
          h="100%"
          w="100%"
          ref={setNodeRef}
          style={{ ...style, zIndex: 100 }}
          {...attributes}
          {...listeners}
          className={classNames(styles.ListTaskRow, {
            [styles.isSelected]: props.isSelected,
            [styles.isReadOnly]: isReadOnly,
          })}
          opacity={isDragging ? 0.5 : undefined}
          wrap="nowrap"
          pos="relative"
        >
          <ActionIcon
            color={props.isSelected ? color("primary") : "gray"}
            variant="subtle"
            className={styles.SelectBox}
            opacity={isReadOnly ? 0 : undefined}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              props.onToggleSelect(e.shiftKey);
            }}
          >
            {props.isSelected ? (
              <IconSquareCheckFilled size={18} />
            ) : (
              <IconSquareDashed strokeWidth={1.5} size={18} />
            )}
          </ActionIcon>

          <ListTaskStatus task={props.task} />

          <Text fz={14} fw={500} flex={1} onClick={props.onOpen}>
            {props.task.name}
          </Text>

          <Group justify="end" pr={8}>
            <ListTaskAssignees task={props.task} readOnly={isReadOnly} />
          </Group>
        </Group>
      )}
    </Group>
  );
});
