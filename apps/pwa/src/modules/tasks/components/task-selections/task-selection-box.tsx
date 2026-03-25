"use client";

import { useColor } from "@/modules/theme/use-color";
import { Group } from "@mantine/core";
import { IconSquareCheckFilled, IconSquareDashed } from "@tabler/icons-react";
import { type FC } from "react";
import { type TaskFragment } from "../../graphql/fragmentTask.graphql";
import { type TasksQueryVariables } from "../../graphql/queryTasks.graphql";
import { useTaskSelections } from "./task-selections-context";
import { classNames } from "@/utils/ui.utils";

export const TaskSelectionBox: FC<{
  task: TaskFragment;
  groupVariables: TasksQueryVariables | null;
  className?: string;
  activeClassName?: string;
}> = ({ task, groupVariables, className, activeClassName }) => {
  const color = useColor();
  const { selected, toggleSelect } = useTaskSelections();
  const isSelected = selected.some((v) => v._id === task._id);

  return (
    <Group
      component="div"
      variant="transparent"
      onClick={(e) => toggleSelect({ task, isShiftKey: e.shiftKey, groupVariables })}
      className={classNames(className, isSelected && activeClassName)}
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
