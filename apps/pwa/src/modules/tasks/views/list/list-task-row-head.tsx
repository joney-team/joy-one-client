"use client";

import { Trans } from "@lingui/react/macro";
import { Group, Text } from "@mantine/core";
import { FC } from "react";
import { TaskFragment } from "../../graphql/fragmentTask.graphql";

export interface ListTaskRowHeadProps {
  hidden?: (keyof TaskFragment)[];
}

export const ListTaskRowHead: FC<ListTaskRowHeadProps> = ({ hidden = [] }) => {
  return (
    <Group justify="space-between" gap={5} wrap="nowrap" py={3} miw={0} pr={6}>
      <Text flex={1} truncate px={10} fz={12} fw={500} c="gray">
        <Trans>Name</Trans>
      </Text>

      {!hidden.includes("assigneeUsers") && (
        <Text px={10} w={150} ta="left" fz={12} fw={500} c="gray">
          <Trans>Assignee</Trans>
        </Text>
      )}

      {!hidden.includes("customer") && (
        <Text px={10} w={200} ta="left" fz={12} fw={500} c="gray">
          <Trans>Customer</Trans>
        </Text>
      )}
      {!hidden.includes("dueDate") && (
        <Text px={10} w={150} ta="left" fz={12} fw={500} c="gray">
          <Trans>Due date</Trans>
        </Text>
      )}
      {!hidden.includes("priority") && (
        <Text px={10} w={70} ta="left" fz={12} fw={500} c="gray">
          <Trans>Priority</Trans>
        </Text>
      )}
    </Group>
  );
};
