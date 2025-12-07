"use client";

import { useColor } from "@/modules/theme/use-color";
import { Group } from "@mantine/core";
import { IconSquareCheckFilled, IconSquareDashed } from "@tabler/icons-react";
import { type FC } from "react";
import { type TaskDataFragment } from "../../queries/fragmentTask.graphql";
import { type TasksQueryVariables } from "../../queries/queryTasks.graphql";
import { useTaskSelections } from "./task-selections-context";

export const TaskSelectionBox: FC<{
  task: TaskDataFragment;
  groupVariables: TasksQueryVariables | null;
  className?: string;
}> = ({ task, groupVariables, className }) => {
  const color = useColor();
  const { selected, toggleSelect } = useTaskSelections();
  const isSelected = selected.some((v) => v._id === task._id);

  return (
    <Group
      component="div"
      variant="transparent"
      onClick={(e) => toggleSelect({ task, isShiftKey: e.shiftKey, groupVariables })}
      className={className}
      data-selected={isSelected}
      w={26}
      h={26}
    >
      {isSelected ? (
        <IconSquareCheckFilled size={18} color={color("primary")} />
      ) : (
        <IconSquareDashed strokeWidth={1.5} size={18} color={color("gray")} />
      )}
    </Group>
  );
};
