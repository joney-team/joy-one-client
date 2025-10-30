"use client";

import { useCalendarProps } from "@/configs/calendar.config";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { useLang } from "@/modules/lang/lang-context";
import { useColor } from "@/modules/theme/use-color";
import {
  isInWorkSlot,
  useWorkDaySlots,
} from "@/modules/workspace-settings/workspace-settings-service";
import { CalendarView } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { classNames } from "@/utils/ui.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { FC, Fragment, useEffect, useRef, useState } from "react";
import { Calendar, SlotInfo } from "react-big-calendar";
import { CalendarViewSelector } from "../calendar-view-selector";
import { DateFormat } from "../format/date-format";
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
  const calendarProps = useCalendarProps();

  const [view, setView] = useState<CalendarView>(props.view || CalendarView.WEEK);

  const workDaySlots = useWorkDaySlots();
  const layout = useLayout();
  const lang = useLang();
  const auth = useAuth();
  const dateFormat = DateTime.getDateFormatString(lang.locale);

  const color = useColor();
  const [date, setDate] = useState<Date>(props.initialDate || new Date());
  const [columnSize, setColumnSize] = useState(0);

  const startWeek = DateTime.getRange(date, "week").start;
  const dayWeek = new Array(7).fill(0).map((_, index) => {
    const date = DateTime.add(startWeek, "day", index);

    return {
      date,
      name: <DateFormat value={date} type="custom" format={{ weekday: "short" }} />,
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
      const start = DateTime.getRange(date, view).start;
      const end = DateTime.getRange(date, view).end;
      return (
        <Fragment>
          <DateFormat value={start} type="custom" format={{ weekday: "short" }} />
          {" - "}
          <DateFormat value={end} type="custom" format={{ weekday: "short" }} />
        </Fragment>
      );
    }

    return <DateFormat value={date} type="custom" format={{ weekday: "long" }} />;
  };

  const nextRange = () => {
    const nextDate = DateTime.add(date, view, 1);
    setDate(nextDate);
    props.onDateChange?.(DateTime.getRange(nextDate, view));
  };

  const previousRange = () => {
    const previousDate = DateTime.subtract(date, view, 1);
    setDate(previousDate);
    props.onDateChange?.(DateTime.getRange(previousDate, view));
  };

  const onSelectSlot = (slot: SlotInfo) => {
    try {
      const isInWorkspaceWorkSlots = isInWorkSlot(
        slot.start,
        workDaySlots.find((v) => v.dayWeek === slot.start.getDay())?.slots
      );

      const conflictEvents = events.filter((e) =>
        DateTime.isBetween(e.start, slot.start, slot.end)
      );

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
  }, [layout.width, auth.user?.settings.isTwelveHour]);

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
              start: DateTime.normalizeDate(e.start),
              end: DateTime.normalizeDate(e.end),
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
