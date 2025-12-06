"use client";

import { NumberFormat } from "@/components/format/number-format";
import { Group, Progress, Stack, Text } from "@mantine/core";
import { useMemo, type FC } from "react";
import { useGanttTaskRow } from "../gantt-task-provider";

export const GanttTaskTimelineChildSummary: FC = () => {
  const { task } = useGanttTaskRow();

  const childProgressColor = useMemo(() => {
    if (task.childProgress === 100) return task.statuses[task.statuses.length - 1]?.color ?? "teal";
    return task.childProgress > 0 ? "orange" : "gray";
  }, [task.childProgress, task.statuses]);

  return (
    <Stack gap={2} miw={0} w="100%">
      <Group gap={5} px={5} miw={0} w="100%" wrap="nowrap" justify="space-between">
        <Text fz={11} fw={600} truncate c={childProgressColor} maw="100%">
          {task.name}
        </Text>

        <Text fz={11} fw={400} truncate c={childProgressColor} maw="100%">
          <NumberFormat value={task.childProgress / 100} format={{ style: "percent" }} />
        </Text>
      </Group>

      <Progress
        miw="100%"
        value={task.childProgress}
        color={childProgressColor}
        animated={task.childProgress > 0 && task.childProgress < 100}
      />
    </Stack>
  );
};
