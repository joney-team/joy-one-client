"use client";

import { EventList } from "@/components/event-list";
import { Trans } from "@lingui/react/macro";
import { Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconTimelineEvent } from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";

interface TaskDetailFooterProps {
  task: TaskDataFragment;
  onClose: () => void;
}

export const TaskDetailFooter: FC<TaskDetailFooterProps> = (props) => {
  const { task } = props;

  return (
    <Fragment>
      <Stack>
        <Group gap={8}>
          <ThemeIcon variant="light" color="gray">
            <IconTimelineEvent strokeWidth={1.5} size={20} />
          </ThemeIcon>

          <Text fw={500} fz={14}>
            <Trans>Activities</Trans>
          </Text>
        </Group>

        <Stack pl={0}>
          <EventList ref={task._id} my={15} mb={30} />
        </Stack>
      </Stack>
    </Fragment>
  );
};
