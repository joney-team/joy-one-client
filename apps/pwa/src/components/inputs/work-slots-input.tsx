"use client";

import { calendarProps } from "@/configs/calendar.config";
import { useLayout } from "@/layout/layout-context";
import { useLang } from "@/modules/lang/lang-context";
import { getDateFormat } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import {
  isInWorkSlot,
  useWorkDaySlots,
} from "@/modules/workspace-settings/workspace-settings-service";
import { CalendarView } from "@/types";
import { parseToTime } from "@/utils/date-time.utils";
import { onError } from "@/utils/exceptions.utils";
import { classNames } from "@/utils/ui.utils";
import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, useEffect, useRef, useState } from "react";
import { Calendar, SlotInfo } from "react-big-calendar";
import { CalendarViewSelector } from "../calendar-view-selector";
import { Renderer } from "../renderer";

export interface WorkSlotEvent {
  id: string;
  title: string;
  start: Date | number;
  end: Date | number;
  color?: string;
}

export interface WorkSlotCreateEventDto {
  start: Date;
  end: Date;
  conflict: {
    isInWorkspaceWorkSlots: boolean;
    events: WorkSlotEvent[];
  };
}

interface WorkSlotsInputProps {
  events?: WorkSlotEvent[];
  onSelectEvent?: (event: WorkSlotEvent) => void;
  onCreate?: (dto: WorkSlotCreateEventDto) => void;
  onDateChange?: (range: { start: Date; end: Date }) => void;
  initialDate?: Date;
  disabled?: boolean;
  view?: CalendarView;
}

export const WorkSlotsInput: FC<WorkSlotsInputProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const events = props.events || [];

  const [view, setView] = useState<CalendarView>(props.view || CalendarView.WEEK);

  const workDaySlots = useWorkDaySlots();
  const layout = useLayout();
  const lang = useLang();

  const color = useColor();
  const [date, setDate] = useState<Date>(props.initialDate || new Date());
  const [columnSize, setColumnSize] = useState(0);

  const startWeek = dayjs(date).startOf("week");
  const dayWeek = new Array(7).fill(0).map((_, index) => {
    const date = startWeek.add(index, "day");

    return {
      date,
      name: date.format("ddd"),
    };
  });

  const syncColumnSize = () => {
    if (ref.current) {
      const collumn = ref.current.getElementsByClassName("rbc-day-slot")[0];
      if (collumn) setColumnSize(collumn.clientWidth);
    }
  };

  const displayDate = () => {
    if ([CalendarView.WEEK].includes(view)) {
      const start = dayjs(date).startOf(view);
      const end = dayjs(date).endOf(view);
      return `${start.format(`ddd ${getDateFormat()}`)} - ${end.format(`ddd ${getDateFormat()}`)}`;
    }

    return dayjs(date).format(`dddd ${getDateFormat()}`);
  };

  const nextRange = () => {
    const nextDate = dayjs(date).add(1, view).toDate();
    setDate(nextDate);
    props.onDateChange?.({
      start: dayjs(date).startOf(view).toDate(),
      end: dayjs(nextDate).endOf(view).toDate(),
    });
  };

  const previousRange = () => {
    const previousDate = dayjs(date).subtract(1, view).toDate();
    setDate(previousDate);
    props.onDateChange?.({
      start: dayjs(previousDate).startOf(view).toDate(),
      end: dayjs(date).endOf(view).toDate(),
    });
  };

  const onSelectSlot = (slot: SlotInfo) => {
    try {
      const isInWorkspaceWorkSlots = isInWorkSlot(
        slot.start,
        workDaySlots.find((v) => v.dayWeek === slot.start.getDay())?.slots
      );

      const conflictEvents = events.filter((e) => {
        const from = dayjs(e.start);
        const to = dayjs(e.end);
        return from.isBefore(slot.start) && to.isAfter(slot.start);
      });

      props.onCreate?.({
        start: slot.start,
        end: slot.end,
        conflict: {
          isInWorkspaceWorkSlots,
          events: conflictEvents,
        },
      });
    } catch (error) {
      onError(error);
    }
  };

  useEffect(() => {
    syncColumnSize();
  }, [layout.width, lang.state.isTwelveHour]);

  return (
    <Stack ref={ref} w="100%" gap={10}>
      <Group justify="space-between">
        <Group>
          <Group gap={5}>
            <ActionIcon
              variant="outline"
              color={color("gray")}
              radius={100}
              onClick={previousRange}
            >
              <IconChevronLeft strokeWidth={1.5} size={18} />
            </ActionIcon>

            <ActionIcon variant="outline" color={color("gray")} radius={100} onClick={nextRange}>
              <IconChevronRight strokeWidth={1.5} size={18} />
            </ActionIcon>
          </Group>

          <Text fz={14} fw={500} tt="capitalize">
            {displayDate()}
          </Text>
        </Group>

        <CalendarViewSelector view={view} onChange={setView} />
      </Group>

      <Stack gap={0}>
        <Renderer visible={view === CalendarView.WEEK}>
          <Group justify="end" gap={0} wrap="nowrap" w="100%">
            {dayWeek.map((day, index) => {
              return (
                <Card
                  key={index}
                  shadow="none"
                  radius={0}
                  px={5}
                  py={0}
                  pb={5}
                  style={{
                    width: `${columnSize}px`,
                    boxSizing: "border-box",
                    display: "flex",
                  }}
                >
                  <Text w="100%" fz={12} ta="right" fw={500} tt="capitalize">
                    {day.name}
                  </Text>
                </Card>
              );
            })}
          </Group>
        </Renderer>

        <Calendar
          {...calendarProps}
          className="hide-header"
          dayLayoutAlgorithm="no-overlap"
          date={date}
          view={view}
          selectable={!props.disabled}
          toolbar={false}
          events={events.map((e) => {
            return {
              id: e.id,
              title: e.title,
              start: parseToTime(e.start)!,
              end: parseToTime(e.end)!,
            };
          })}
          popup
          onSelectSlot={onSelectSlot}
          onSelectEvent={(e) => {
            const event = props.events?.find((v) => v.id === e.id);
            if (event) props.onSelectEvent?.(event);
          }}
          // TODO: implement hide out of work slots
          // slotGroupPropGetter={(([from, end]: [Date, Date]) => {
          //   const isRangeOutOfWorkSlots = workSlotsRange.from.hour > (from.getHours() + cropOffsetHour)
          //     || workSlotsRange.to.hour < (end.getHours())

          //   if (isRangeOutOfWorkSlots && isHideOutOfWorkSlot) {
          //     return {
          //       style: {
          //         opacity: 0.5,
          //       }
          //     }
          //   }

          //   return {}
          // }) as any}
          slotPropGetter={(slot) => {
            const workDaySlot = workDaySlots.find((v) => v.dayWeek === slot.getDay());
            const isInWorkspaceWorkSlots = isInWorkSlot(slot, workDaySlot?.slots);

            const isAvailable = isInWorkspaceWorkSlots && !props.disabled;

            return {
              className: classNames({ available: isAvailable }),
              style: {
                backgroundColor: isAvailable ? "white" : color("gray.1"),
              },
            };
          }}
          eventPropGetter={(e) => {
            const event = events.find((v) => v.id === e.id);
            const eventColor = event?.color || "primary";

            return {
              style: {
                backgroundColor: color(eventColor),
                borderColor: color(eventColor + ".8"),
              },
            };
          }}
        />
      </Stack>
    </Stack>
  );
};
