"use client";

import { CalendarView } from "@/types";
import { renderDate, t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, alpha, em } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconCalendarDown, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, useState } from "react";
import { Button } from "./buttons/button";
import { CalendarViewSelector } from "./calendar-view-selector";
import { LaunchingSoon } from "./launching-soon";
import { useColorScheme } from "@/modules/theme/use-color-scheme";

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

  const startAt = dayjs(date).startOf(view);
  const endAt = dayjs(date).endOf(view);

  const nextRange = () => {
    const nextDate = dayjs(date).add(1, view).toDate();
    setDate(nextDate);
    props.onChange?.({
      start: dayjs(nextDate).startOf(view).toDate(),
      end: dayjs(nextDate).endOf(view).toDate(),
    });
  };

  const previousRange = () => {
    const previousDate = dayjs(date).subtract(1, view).toDate();
    setDate(previousDate);
    props.onChange?.({
      start: dayjs(previousDate).startOf(view).toDate(),
      end: dayjs(previousDate).endOf(view).toDate(),
    });
  };

  const goToday = () => {
    setDate(new Date());
    props.onChange?.({ start: new Date(), end: new Date() });
  };

  const calendarRange = {
    [CalendarView.DAY]: (
      <Group gap={3}>
        <Text tt="capitalize" fw={600} fz={16}>
          {dayjs(date).format("dddd")}
        </Text>
        <Text fw={300} fz={16}>
          {renderDate(date)}
        </Text>
      </Group>
    ),
    [CalendarView.WEEK]: (
      <Group gap={3}>
        <Text tt="capitalize" fz={16}>
          {renderDate(startAt.toDate())}
        </Text>
        <Text fz={16}>-</Text>
        <Text fz={16}>{renderDate(endAt.toDate())}</Text>
      </Group>
    ),
    [CalendarView.MONTH]: (
      <Group gap={3}>
        <Text tt="capitalize" fw={600} fz={16}>
          {dayjs(date).format("MMMM")}
        </Text>
        <Text fw={300} fz={16}>
          {dayjs(date).format("YYYY")}
        </Text>
      </Group>
    ),
  };

  const calendarViews: Record<CalendarView, React.ReactNode | undefined> = {
    [CalendarView.DAY]: undefined,
    [CalendarView.WEEK]: undefined,
    [CalendarView.MONTH]: (
      <MonthView {...props} _startAt={startAt.toDate()} _endAt={endAt.toDate()} />
    ),
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
          {!dayjs(date).isSame(new Date(), view) && (
            <Button size="compact-sm" leftIcon={IconCalendarDown} variant="light" onClick={goToday}>
              {t("today")}
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
    _startAt: Date;
    _endAt: Date;
  }
> = (props) => {
  const borderColor = alpha("gray", 0.1);

  return (
    <Card p={0} withBorder shadow="none">
      <SimpleGrid cols={7} spacing={0}>
        {dayCols.map((_, index) => {
          const date = dayjs(dayjs(props._startAt).startOf("week")).add(index, "day");

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
                {date.format("ddd")}
              </Text>
            </Group>
          );
        })}

        {dayRows.map((_, weekIndex) => {
          const weekStartAt = dayjs(dayjs(props._startAt).add(weekIndex, "week").startOf("week"));

          return dayCols.map((_, dayIndex) => {
            const thisDate = dayjs(weekStartAt).add(dayIndex, "day").toDate();
            const isInThisMonth = thisDate.getMonth() === props._startAt.getMonth();
            const isToday = dayjs(thisDate).isSame(dayjs(), "day");

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
