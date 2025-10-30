"use client";

import { Group, Text, ThemeIcon } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import { FC, useEffect } from "react";
import { DateFormat } from "./format/date-format";

export const Timer: FC = () => {
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate();
    }, 1000);

    return () => clearInterval(interval);
  }, [forceUpdate]);

  return (
    <Group justify="center" align="center" gap={15}>
      <Group gap={0}>
        <ThemeIcon variant="transparent" color="dark">
          <IconCalendar size={18} />
        </ThemeIcon>

        <Group wrap="nowrap" justify="center" align="center" gap={3}>
          <Text>
            <DateFormat value={new Date()} type="date" />
          </Text>
        </Group>
      </Group>

      <Group gap={0}>
        <ThemeIcon variant="transparent" color="dark">
          <IconClock size={18} />
        </ThemeIcon>

        <Group wrap="nowrap" justify="center" align="center" gap={3}>
          <Text ta="center" miw={22}>
            <DateFormat value={new Date()} type="custom" format={{ hour: "2-digit" }} />
          </Text>
          <Text ta="center">:</Text>
          <Text ta="center" miw={22}>
            <DateFormat value={new Date()} type="custom" format={{ minute: "2-digit" }} />
          </Text>
          <Text ta="center">:</Text>
          <Text ta="center" miw={22}>
            <DateFormat value={new Date()} type="custom" format={{ second: "2-digit" }} />
          </Text>
        </Group>
      </Group>
    </Group>
  );
};
