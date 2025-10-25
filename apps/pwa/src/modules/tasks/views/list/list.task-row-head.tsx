"use client";

import { Trans } from "@lingui/react/macro";
import { Group, Text } from "@mantine/core";
import { FC } from "react";

export const ListTaskRowHead: FC = () => {
  return (
    <Group justify="space-between" gap={5}>
      <Text flex={1} px={10} fz={13} fw={500} c="gray">
        <Trans>Name</Trans>
      </Text>

      <Text px={10} w={150} ta="left" fz={13} fw={500} c="gray">
        <Trans>Assignee</Trans>
      </Text>
      <Text px={10} w={200} ta="left" fz={13} fw={500} c="gray">
        <Trans>Customer</Trans>
      </Text>
      <Text px={10} w={150} ta="left" fz={13} fw={500} c="gray">
        <Trans>Due date</Trans>
      </Text>
      <Text px={10} w={70} ta="left" fz={13} fw={500} c="gray">
        <Trans>Priority</Trans>
      </Text>
    </Group>
  );
};
