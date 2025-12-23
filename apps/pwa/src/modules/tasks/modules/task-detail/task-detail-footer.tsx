"use client";

import { Trans } from "@lingui/react/macro";
import { Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconTimelineEvent } from "@tabler/icons-react";
import { FC } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";

interface TaskActivitiesProps {
  task: TaskDataFragment;
}

export const TaskActivities: FC<TaskActivitiesProps> = ({ task }) => {
  return (
    <Stack gap="sm">
      <Group gap="sm">
        <ThemeIcon variant="light" color="gray">
          <IconTimelineEvent strokeWidth={1.5} size={20} />
        </ThemeIcon>

        <Text fw={500} fz={14}>
          <Trans>Activities</Trans>
        </Text>
      </Group>
    </Stack>
  );
};
