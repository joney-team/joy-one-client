import { ActionIcon } from "@mantine/core";
import { type FC } from "react";
import { useColor } from "@/modules/theme/use-color";
import { IconSquareCheckFilled, IconSquareDashed } from "@tabler/icons-react";
import { type TaskDataFragment } from "../../queries/fragmentTask.graphql";
import { type TasksQueryVariables } from "../../queries/queryTasks.graphql";
import { useTaskSelections } from "./task-selections-context";

export const TaskSelectionBox: FC<{
  task: TaskDataFragment;
  groupVariables?: TasksQueryVariables;
  className?: string;
}> = ({ task, groupVariables, className }) => {
  const color = useColor();
  const { selected, toggleSelect } = useTaskSelections();
  const isSelected = selected.some((v) => v._id === task._id);

  return (
    <ActionIcon
      component="div"
      color={isSelected ? color("primary") : "gray"}
      variant="subtle"
      onClick={(e) =>
        toggleSelect({ task, isShiftKey: e.shiftKey, groupVariables: groupVariables })
      }
      className={className}
      data-selected={isSelected}
    >
      {isSelected ? (
        <IconSquareCheckFilled size={18} />
      ) : (
        <IconSquareDashed strokeWidth={1.5} size={18} />
      )}
    </ActionIcon>
  );
};
