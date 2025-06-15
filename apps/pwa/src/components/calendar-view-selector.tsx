"use client";

import { CalendarView } from "@/types";
import { t } from "@/modules/lang/lang-service";
import { ActionIcon, Button, Card, Group, Tooltip } from "@mantine/core";
import {
  IconCalendar,
  IconCalendarFilled,
  IconCalendarMonth,
  IconCalendarMonthFilled,
  IconCalendarWeek,
  IconCalendarWeekFilled,
} from "@tabler/icons-react";
import { FC } from "react";
import { useColor } from "@/modules/theme/use-color";

const viewIcons = {
  [CalendarView.DAY]: {
    normal: IconCalendar,
    active: IconCalendarFilled,
  },
  [CalendarView.WEEK]: {
    normal: IconCalendarWeek,
    active: IconCalendarWeekFilled,
  },
  [CalendarView.MONTH]: {
    normal: IconCalendarMonth,
    active: IconCalendarMonthFilled,
  },
};

export const CalendarViewSelector: FC<{
  view: CalendarView;
  onChange: (view: CalendarView) => void;
  hideLabel?: boolean;
}> = (props) => {
  const color = useColor();

  return (
    <Card bg="var(--mantine-color-default-hover)" p={3} shadow="none">
      <Group gap={3}>
        {Object.entries(viewIcons).map(([key, value]) => {
          const isActive = props.view === key;
          const Icon = isActive ? value.active : value.normal;

          if (!props.hideLabel) {
            return (
              <Button
                key={key}
                variant={isActive ? "filled" : "subtle"}
                color={color(isActive ? "primary" : "gray")}
                onClick={() => props.onChange(key as CalendarView)}
                leftSection={<Icon strokeWidth={1.5} size={16} style={{ marginRight: -8 }} />}
                size="compact-sm"
                fz={11}
                tt="capitalize"
                px={8}
              >
                {t(key)}
              </Button>
            );
          }

          return (
            <Tooltip key={key} label={t(key)} tt="capitalize">
              <ActionIcon
                variant={isActive ? "filled" : "subtle"}
                color={color(isActive ? "primary" : "gray")}
                onClick={() => props.onChange(key as CalendarView)}
              >
                <Icon strokeWidth={1.5} size={16} />
              </ActionIcon>
            </Tooltip>
          );
        })}
      </Group>
    </Card>
  );
};
