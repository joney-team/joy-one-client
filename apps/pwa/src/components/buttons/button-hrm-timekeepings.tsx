"use client";

import { EventType } from "@/graphql/enums.graphql";
import { getPreviousTimeKeeping } from "@/modules/hrm-timekeepings/hrm-timekeepings-service";
import { HrmTimekeepingType } from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { OnModalCaptureLocationTimekeeping } from "@/modules/hrm-timekeepings/modals/modal-capture-location-timekeeping";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/useWorkspaceSetting";
import { useFetch } from "@/utils/use-fetch.util";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Group, Stack, Text, ThemeIcon, em } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { IconAnalyze, IconLogin2, IconLogout } from "@tabler/icons-react";
import { FC, useEffect } from "react";
import { Button } from "./button";

export const ButtonHrmTimeKeeping: FC = () => {
  const forceUpdate = useForceUpdate();
  const { isHrmTimekeepingAvailable } = useWorkspaceSetting();

  const previousTimekeeping = useFetch({
    fetch: () => getPreviousTimeKeeping(),
    refetchEvents: [EventType.HrmTimekeepingMemberCheckIn, EventType.HrmTimekeepingMemberCheckOut],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const prevType = previousTimekeeping.data?.type || HrmTimekeepingType.CHECK_OUT;
  const nextType =
    prevType === HrmTimekeepingType.CHECK_IN
      ? HrmTimekeepingType.CHECK_OUT
      : HrmTimekeepingType.CHECK_IN;

  if (!isHrmTimekeepingAvailable) return null;

  if (nextType === HrmTimekeepingType.CHECK_IN) {
    return (
      <Button
        leftSection={<IconLogin2 size={18} />}
        onClick={() => OnModalCaptureLocationTimekeeping()}
        size="xs"
      >
        Chấm công
      </Button>
    );
  }

  const workTime = previousTimekeeping.data
    ? DateTime.countdown(Date.now(), previousTimekeeping.data.time * 1000)
    : undefined;

  return (
    <Stack gap={5}>
      <Button
        rightSection={<IconLogout size={18} />}
        color="orange.8"
        onClick={() => OnModalCaptureLocationTimekeeping()}
        size="xs"
      >
        Chấm công
      </Button>

      {workTime && (
        <Group justify="right" gap={5}>
          <Text c="orange" fz={em(12)} ta="center" w={16} fw={500}>
            {workTime.hours.toString().padStart(2, "0")}
          </Text>
          <Text c="orange" fz={em(12)} ta="center" fw={500}>
            :
          </Text>
          <Text c="orange" fz={em(12)} ta="center" w={16} fw={500}>
            {workTime.minutes.toString().padStart(2, "0")}
          </Text>
          <Text c="orange" fz={em(12)} ta="center" fw={500}>
            :
          </Text>
          <Text c="orange" fz={em(12)} ta="center" w={16} fw={500}>
            {workTime.seconds.toString().padStart(2, "0")}
          </Text>

          <ThemeIcon size="xs" color="orange" variant="transparent">
            <IconAnalyze size={18} style={{ animation: `symbolLoader 2s linear infinite` }} />
          </ThemeIcon>
        </Group>
      )}
    </Stack>
  );
};
