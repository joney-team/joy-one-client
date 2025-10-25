"use client";

import { ButtonArchive } from "@/components/buttons/button-archive";
import { EventList } from "@/components/event-list";
import { updateTasks } from "@/modules/tasks/tasks-service";
import { TaskEntity } from "@/modules/tasks/tasks-types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconTimelineEvent } from "@tabler/icons-react";
import { FC, Fragment } from "react";

interface DetailFooterProps {
  task: TaskEntity;
  onClose: () => void;
}

export const DetailFooter: FC<DetailFooterProps> = (props) => {
  const { task, onClose } = props;
  return (
    <Fragment>
      <Stack>
        <Group gap={8}>
          <ThemeIcon variant="light" color="dark">
            <IconTimelineEvent strokeWidth={1.5} size={20} />
          </ThemeIcon>

          <Text fw={500}>
            <Trans>Activities</Trans>
          </Text>
        </Group>

        <Stack pl={0}>
          <EventList ref={task._id} my={15} mb={30} />
        </Stack>
      </Stack>

      <ButtonArchive
        name={t`Task`}
        process={async () => {
          if (!task) return;
          await updateTasks([{ ...task, isArchived: true }]);
          onClose();
        }}
      />
    </Fragment>
  );
};
