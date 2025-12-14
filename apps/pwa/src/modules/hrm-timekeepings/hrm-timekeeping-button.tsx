"use client";

import { Button } from "@/components/buttons/button";
import { TimekeepingsIllustration } from "@/components/illustrations/timekeepings";
import { useHrmTimekeeping } from "@/modules/hrm-timekeepings/hooks";
import { HrmTimekeepingType } from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { OnModalCaptureLocationTimekeeping } from "@/modules/hrm-timekeepings/modals/modal-capture-location-timekeeping";
import { useColor } from "@/modules/theme/use-color";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Group,
  Indicator,
  Popover,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { IconAnalyze, IconClockHour12, IconClockRecord } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { hrmTimekeepingTypes } from "./hrm-timekeepings-constants";

export const HrmTimekeepingButton: FC = () => {
  const timekeeping = useHrmTimekeeping();
  const forceUpdate = useForceUpdate();

  const [opened, setOpened] = useState(false);
  const color = useColor();

  const prevType = timekeeping.prevTimekeeping?.type || HrmTimekeepingType.CHECK_OUT;
  const nextType =
    prevType === HrmTimekeepingType.CHECK_IN
      ? HrmTimekeepingType.CHECK_OUT
      : HrmTimekeepingType.CHECK_IN;
  const nextColor = nextType === HrmTimekeepingType.CHECK_IN ? "primary" : "orange";

  const workTime =
    timekeeping.prevTimekeeping && timekeeping.prevTimekeeping.type === HrmTimekeepingType.CHECK_IN
      ? DateTime.countdown(new Date(), timekeeping.prevTimekeeping.time)
      : undefined;

  useEffect(() => {
    if (workTime) {
      const interval = setInterval(forceUpdate, 1000);
      return () => clearInterval(interval);
    }
  }, [workTime]);

  if (!timekeeping.isAvailable) return null;

  return (
    <Popover width={400} shadow="xs" opened={opened} onChange={setOpened}>
      <Popover.Target>
        <Tooltip disabled={!!workTime} label={workTime ? `` : t`Timekeepings`}>
          <Indicator
            color={color(nextColor)}
            position="top-center"
            offset={3}
            label={
              <Text fz={7} fw={900}>
                {workTime
                  ? `${workTime.hours.toString().padStart(2, "0")}:${workTime.minutes
                      .toString()
                      .padStart(2, "0")}`
                  : ""}
              </Text>
            }
            disabled={!workTime}
            styles={{
              indicator: {
                padding: "0 4px",
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            <ActionIcon
              size={30}
              variant="subtle"
              color={color(workTime ? "orange.8" : "var(--mantine-color-text)")}
              onClick={() => setOpened(!opened)}
            >
              {workTime ? (
                <IconClockHour12
                  style={{
                    rotate: `${new Date().getSeconds() * 6}deg`,
                  }}
                  size={20}
                  strokeWidth={1.5}
                />
              ) : (
                <IconClockRecord size={20} strokeWidth={1.5} />
              )}
            </ActionIcon>
          </Indicator>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        {(function () {
          if (timekeeping.loading) return <Skeleton h={150} />;

          return (
            <Stack align="center" p={16}>
              <TimekeepingsIllustration width={180} color={nextColor} />

              <Text ta="center" fw={600}>
                <Trans>Working time</Trans>
              </Text>

              {workTime && (
                <Group justify="right" gap={5}>
                  <Text c="orange.8" fz={20} ta="center" w={25} fw={500}>
                    {workTime.hours.toString().padStart(2, "0")}
                  </Text>
                  <Text c="orange.8" fz={20} ta="center" fw={500}>
                    :
                  </Text>
                  <Text c="orange.8" fz={20} ta="center" w={25} fw={500}>
                    {workTime.minutes.toString().padStart(2, "0")}
                  </Text>
                  <Text c="orange.8" fz={20} ta="center" fw={500}>
                    :
                  </Text>
                  <Text c="orange.8" fz={20} ta="center" w={25} fw={500}>
                    {workTime.seconds.toString().padStart(2, "0")}
                  </Text>

                  <ThemeIcon color="orange.8" variant="transparent">
                    <IconAnalyze size={22} style={{ animation: `animRotate 2s linear infinite` }} />
                  </ThemeIcon>
                </Group>
              )}

              <Group justify="center" wrap="nowrap" gap={10}>
                <Button
                  radius={100}
                  color={color(hrmTimekeepingTypes[timekeeping.nextType].color)}
                  leftIcon={hrmTimekeepingTypes[timekeeping.nextType].icon}
                  onClick={() => {
                    setOpened(false);
                    OnModalCaptureLocationTimekeeping();
                  }}
                >
                  {hrmTimekeepingTypes[timekeeping.nextType].name()}
                </Button>
              </Group>
            </Stack>
          );
        })()}
      </Popover.Dropdown>
    </Popover>
  );
};
