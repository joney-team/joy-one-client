"use client";

import { formatDuration } from "@/components/inputs/estimate-time-input/estimate-time-input-utils";
import { alpha, Group, Tooltip } from "@mantine/core";
import { type FC } from "react";
import { useGanttTaskRow } from "../gantt-task-provider";
import { Trans } from "@lingui/react/macro";
import { useGantt } from "../../gantt-tasks-context";
import { Badge } from "@/components/badge";

export const GanttTaskEstimatedTime: FC = () => {
  const gantt = useGantt();
  const { task } = useGanttTaskRow();

  if ((!task.estimatedTime && !task.childEstimatedTime) || !gantt.state.isShowEstimatedTime)
    return null;

  const selfEstimatedTime = formatDuration(task.estimatedTime ?? 0);

  return (
    <Group
      pos="sticky"
      style={{
        width: "max-content",
        top: 0,
        left: 0,
        height: "100%",
        zIndex: 2,
      }}
      px={3}
      align="center"
    >
      {task.childEstimatedTime ? (
        <Tooltip.Floating
          label={<Trans>Parent task estimated time: {selfEstimatedTime}</Trans>}
          style={{ fontSize: 11 }}
          disabled={!task.estimatedTime}
        >
          <Badge bg={alpha("gray", 0.3)} size="xs" tt="none">
            {formatDuration(task.childEstimatedTime)}
          </Badge>
        </Tooltip.Floating>
      ) : (
        <Badge bg={alpha("gray", 0.3)} size="xs" tt="none">
          {formatDuration(task.estimatedTime ?? 0)}
        </Badge>
      )}
    </Group>
  );
};
