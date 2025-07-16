import { em } from "@mantine/core";

import { useColor } from "@/modules/theme/use-color";
import { useTaskDrop } from "@/modules/tasks/tasks-dnd-provider";
import { ReorderTaskPotision } from "@/modules/tasks/tasks-types";

import { TaskEntity } from "@/modules/tasks/tasks-types";
import { Box } from "@mantine/core";
import { IconCaretRightFilled } from "@tabler/icons-react";
import { FC } from "react";

export const ListTaskRowDropper: FC<{
  targetTask: TaskEntity;
  position: ReorderTaskPotision;
  isSubTask?: boolean;
  indexSpacing?: number;
  visible?: boolean;
}> = (props) => {
  const Render: FC = () => {
    const color = useColor();

    const id = `${props.targetTask._id}-${props.position}-${props.isSubTask ? "sub" : "main"}`;
    const droppable = useTaskDrop(id, {
      taskId: props.targetTask._id,
      position: props.position,
      isSubTask: props.isSubTask,
      changeStatus: props.isSubTask ? null : props.targetTask.status,
    });

    const width = `calc(100% - ${props.indexSpacing || 0}px)`;
    const activeColor = color(props.isSubTask ? "orange" : "primary");

    return (
      <Box
        ref={droppable.setNodeRef}
        id={droppable.id}
        style={{
          position: "absolute",
          top: props.position === ReorderTaskPotision.BEFORE ? 0 : undefined,
          bottom: props.position === ReorderTaskPotision.BEFORE ? undefined : 0,
          left: props.indexSpacing || 0,
          width: width,
          height: "3px",
          background: droppable.isOver ? activeColor : "transparent",
          zIndex: props.isSubTask ? 1 : 0,
        }}
      >
        {props.isSubTask && droppable.isOver && (
          <IconCaretRightFilled
            color={activeColor}
            size={em(18)}
            style={{
              position: "absolute",
              top: "50%",
              left: -10,
              transform: "translateY(-50%)",
            }}
          />
        )}
      </Box>
    );
  };

  if (!props.visible) return null;
  return <Render />;
};
