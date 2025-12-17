"use client";

import { useColor } from "@/modules/theme/use-color";
import { CalendarView } from "@/types";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { IconCalendarDown, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { FC, useState } from "react";
import { Button } from "../buttons/button";
import { CalendarViewSelector } from "../calendar-view-selector";
import { DateFormat } from "../format/date-format";
import { LaunchingSoon } from "../launching-soon";
import { CalendarMonthView } from "./calendar-month-view";

interface CalendarProps {
  initialDate?: Date;
  onChange?: (range: { start: Date; end: Date }) => void;
  renderDay?: (date: Date, hovered: boolean, isOutOfRange: boolean) => React.ReactNode;
  renderDayHead?: (date: Date, hovered: boolean, isOutOfRange: boolean) => React.ReactNode;
  daySlotMinHeight?: number;
}

export const Calendar: FC<CalendarProps> = (props) => {
  const color = useColor();
  const [date, setDate] = useState<Date>(props.initialDate || new Date());
  const [view, setView] = useState<CalendarView>(CalendarView.MONTH);

  const range = DateTime.getRange(date, view);

  const nextRange = () => {
    const nextDate = DateTime.add(date, view, 1);
    setDate(nextDate);

    const nextRange = DateTime.getRange(nextDate, view);
    props.onChange?.(nextRange);
  };

  const previousRange = () => {
    const previousDate = DateTime.subtract(date, view, 1);
    setDate(previousDate);
    const previousRange = DateTime.getRange(previousDate, view);
    props.onChange?.(previousRange);
  };

  const goToday = () => {
    setDate(new Date());
    props.onChange?.({ start: new Date(), end: new Date() });
  };

  const calendarRange = {
    [CalendarView.DAY]: (
      <Group gap={3}>
        <Text tt="capitalize" fw={600} fz={16}>
          <DateFormat value={date} type="custom" format={{ weekday: "long" }} />
        </Text>
        <Text fw={300} fz={16}>
          <DateFormat value={date} type="date" />
        </Text>
      </Group>
    ),
    [CalendarView.WEEK]: (
      <Group gap={3}>
        <Text tt="capitalize" fz={16}>
          <DateFormat value={range.start} type="date" />
        </Text>
        <Text fz={16}>-</Text>
        <Text fz={16}>
          <DateFormat value={range.end} type="date" />
        </Text>
      </Group>
    ),
    [CalendarView.MONTH]: (
      <Group gap={3}>
        <Text tt="capitalize" fw={600} fz={16}>
          <DateFormat value={date} type="custom" format={{ month: "long" }} />
        </Text>
        <Text fw={300} fz={16}>
          <DateFormat value={date} type="custom" format={{ year: "numeric" }} />
        </Text>
      </Group>
    ),
  };

  const calendarViews: Record<CalendarView, React.ReactNode | undefined> = {
    [CalendarView.DAY]: undefined,
    [CalendarView.WEEK]: undefined,
    [CalendarView.MONTH]: <CalendarMonthView {...props} startAt={range.start} endAt={range.end} />,
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Group>
          <Group gap={5}>
            <ActionIcon variant="outline" color={color("gray")} size="sm" onClick={previousRange}>
              <IconChevronLeft strokeWidth={1.5} size={18} />
            </ActionIcon>

            <ActionIcon variant="outline" color={color("gray")} size="sm" onClick={nextRange}>
              <IconChevronRight strokeWidth={1.5} size={18} />
            </ActionIcon>
          </Group>

          {calendarRange[view]}
        </Group>

        <Group gap={5}>
          {!DateTime.isSame(date, new Date(), view) && (
            <Button size="compact-sm" leftIcon={IconCalendarDown} variant="light" onClick={goToday}>
              <Trans>Today</Trans>
            </Button>
          )}

          <CalendarViewSelector view={view} onChange={setView} />
        </Group>
      </Group>

      {calendarViews[view] || <LaunchingSoon shadow="none" />}
    </Stack>
  );
};
