"use client";

import { DefaultTaskStatusId, TaskStatus } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { Group } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { FC, MouseEventHandler } from "react";

export const TaskStatusIcon: FC<
  Pick<TaskStatus, "id" | "color" | "name"> & {
    size?: number;
    onClick?: MouseEventHandler<HTMLDivElement> | undefined;
    mr?: number;
    white?: boolean;
    opacity?: number;
  }
> = (props) => {
  const size = props.size || 18;
  const color = useColor();
  const statusColor = color(props.color || "gray");
  const closed = props.id === DefaultTaskStatusId.CLOSED;

  return (
    <Group
      className="TaskStatusIcon"
      w={size}
      h={size}
      mr={props.mr}
      style={{
        borderWidth: 1.5,
        borderStyle: "solid",
        borderRadius: "50%",
        cursor: "pointer",
        borderColor: props.white ? "white" : statusColor,
      }}
      opacity={props.opacity}
      bg={props.white || closed ? statusColor : "transparent"}
      p={closed ? 0 : 1.5}
      align="center"
      justify="center"
      onClick={props.onClick}
    >
      {closed ? (
        <IconCheck
          color={props.white || closed ? "white" : statusColor}
          size={size * 0.7}
          strokeWidth={3}
        />
      ) : (
        <Group
          bg={props.white ? "white" : statusColor}
          w="100%"
          h="100%"
          style={{ borderRadius: "50%" }}
        />
      )}
    </Group>
  );
};
