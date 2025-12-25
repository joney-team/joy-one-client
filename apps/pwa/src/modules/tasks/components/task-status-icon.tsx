"use client";

import { CircularProgress } from "@/components/circular-progress/circular-progress";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { Group } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { FC, MouseEventHandler } from "react";
import { TaskStatusDataFragment } from "../graphql/fragmentTaskStatus.graphql";

export const TaskStatusIcon: FC<
  Pick<TaskStatusDataFragment, "id" | "color" | "progress"> & {
    size?: number;
    onClick?: MouseEventHandler<HTMLDivElement> | undefined;
    opacity?: number;
    progress?: number;
  }
> = (props) => {
  const size = props.size || 16;
  const color = useColor();
  const statusColor = color(props.color || "gray");
  const closed = props.id === DefaultTaskStatusId.CLOSED;
  const plainProgress = props.progress ?? 0;
  const progress = plainProgress > 1 ? plainProgress / 100 : plainProgress;

  if (!closed) {
    return (
      <CircularProgress
        size={size}
        progress={progress}
        color={statusColor}
        borderType={progress === 0 ? "dashed" : "solid"}
      />
    );
  }

  return (
    <Group
      className="TaskStatusIcon"
      w={size}
      h={size}
      style={{
        borderRadius: "50%",
      }}
      opacity={props.opacity}
      bg={statusColor}
      align="center"
      justify="center"
      onClick={props.onClick}
    >
      <IconCheck color={closed ? "white" : statusColor} size={size * 0.7} strokeWidth={3} />
    </Group>
  );
};
