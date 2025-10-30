"use client";

import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { CalendarView } from "@/types";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, alpha, em } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconCalendarDown, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { FC, useState } from "react";
import { Button } from "./buttons/button";
import { CalendarViewSelector } from "./calendar-view-selector";
import { DateFormat } from "./format/date-format";
import { LaunchingSoon } from "./launching-soon";

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
    [CalendarView.MONTH]: <MonthView {...props} startAt={range.start} endAt={range.end} />,
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

const dayCols = new Array(7).fill(0);
const dayRows = new Array(6).fill(0);

const MonthView: FC<
  CalendarProps & {
    startAt: Date;
    endAt: Date;
  }
> = (props) => {
  const borderColor = alpha("gray", 0.1);
  const startOfWeek = DateTime.getRange(props.startAt, "week").start;

  return (
    <Card p={0} withBorder shadow="none">
      <SimpleGrid cols={7} spacing={0}>
        {dayCols.map((_, index) => {
          const date = DateTime.add(startOfWeek, "day", index);

          return (
            <Group
              key={index}
              align="center"
              px={4}
              py={4}
              style={{
                borderLeft: index !== 0 ? `1px solid ${borderColor}` : undefined,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <Text fz={em(12)} fw={600}>
                <DateFormat value={date} type="custom" format={{ weekday: "short" }} />
              </Text>
            </Group>
          );
        })}

        {dayRows.map((_, weekIndex) => {
          const weekStartAt = DateTime.add(props.startAt, "week", weekIndex);

          return dayCols.map((_, dayIndex) => {
            const thisDate = DateTime.add(weekStartAt, "day", dayIndex);
            const isInThisMonth = thisDate.getMonth() === props.startAt.getMonth();
            const isToday = DateTime.isSame(thisDate, new Date(), "day");

            return (
              <DateSlot
                key={`${weekIndex}-${dayIndex}`}
                weekIndex={weekIndex}
                dayIndex={dayIndex}
                thisDate={thisDate}
                isInThisMonth={isInThisMonth}
                isToday={isToday}
                borderColor={borderColor}
                renderDay={props.renderDay}
                renderDayHead={props.renderDayHead}
                minHeight={props.daySlotMinHeight}
              />
            );
          });
        })}
      </SimpleGrid>
    </Card>
  );
};

const DateSlot: FC<{
  weekIndex?: number;
  dayIndex?: number;
  thisDate: Date;
  isInThisMonth: boolean;
  isToday: boolean;
  borderColor: string;
  renderDay?: (date: Date, hovered: boolean, isOutOfRange: boolean) => React.ReactNode;
  renderDayHead?: (date: Date, hovered: boolean, isOutOfRange: boolean) => React.ReactNode;
  minHeight?: number;
}> = (props) => {
  const { dayIndex, thisDate, isInThisMonth, isToday, weekIndex, borderColor } = props;

  const color = useColor();
  const hover = useHover();
  const mih = typeof props.minHeight === "number" ? props.minHeight : 110;
  const colorScheme = useColorScheme();

  const bg = {
    light: isInThisMonth ? "white" : "gray.1",
    dark: isInThisMonth ? "var(--mantine-color-default-hover)" : "var(--mantine-color-body)",
  };

  return (
    <Stack
      ref={hover.ref}
      key={`${weekIndex}-${dayIndex}`}
      p={3}
      gap={8}
      align="stretch"
      bg={bg[colorScheme]}
      mih={mih}
      w="100%"
      style={{
        borderLeft: dayIndex !== 0 ? `1px solid ${borderColor}` : undefined,
        borderTop: weekIndex !== 0 ? `1px solid ${borderColor}` : undefined,
        position: "relative",
      }}
    >
      <Group gap={5} w="100%">
        <Badge
          fw={500}
          fz={14}
          w={30}
          h={30}
          p={0}
          opacity={props.isInThisMonth ? 1 : 0.5}
          color={color(isToday ? "primary" : "var(--mantine-color-text)")}
          variant={isToday ? "light" : "transparent"}
        >
          {thisDate.getDate()}
        </Badge>

        {props.renderDayHead
          ? props.renderDayHead(thisDate, hover.hovered, !props.isInThisMonth)
          : null}
      </Group>

      {props.renderDay ? props.renderDay(thisDate, hover.hovered, !props.isInThisMonth) : null}
    </Stack>
  );
};
