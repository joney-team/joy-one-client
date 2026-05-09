"use client";

import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { DateTime } from "@joy-one/utils/date-time";
import { Card, Group, SimpleGrid, Stack, Text, alpha, em } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { FC } from "react";
import { Badge } from "../badge";
import { DateFormat } from "../format/date-format";
import { CalendarProps, CalendarViewProps } from "./calendar-types";

const DateSlot: FC<
  {
    weekIndex?: number;
    dayIndex?: number;
    thisDate: Date;
    isInThisMonth: boolean;
    isToday: boolean;
    borderColor: string;
    renderDay?: (date: Date, hovered: boolean, isOutOfRange: boolean) => React.ReactNode;
    renderDayHead?: (date: Date, hovered: boolean, isOutOfRange: boolean) => React.ReactNode;
    minHeight?: number;
  } & Pick<CalendarProps, "components">
> = (props) => {
  const { dayIndex, thisDate, isInThisMonth, isToday, weekIndex, borderColor } = props;

  const color = useColor();
  const hover = useHover();
  const mih = typeof props.minHeight === "number" ? props.minHeight : 110;
  const colorScheme = useColorScheme();

  const bg = {
    light: isInThisMonth ? "white" : "gray.1",
    dark: isInThisMonth ? "var(--mantine-color-default-hover)" : "var(--mantine-color-body)",
  };

  const MonthDateComponent = props.components?.monthDate;

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

      {MonthDateComponent ? (
        <MonthDateComponent
          date={thisDate}
          hovered={hover.hovered}
          isOutOfRange={!props.isInThisMonth}
        />
      ) : null}
    </Stack>
  );
};

const dayCols = new Array(7).fill(0);
const dayRows = new Array(6).fill(0);

export const CalendarMonthView: FC<CalendarViewProps> = (props) => {
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
                components={props.components}
              />
            );
          });
        })}
      </SimpleGrid>
    </Card>
  );
};
