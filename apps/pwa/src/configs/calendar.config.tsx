"use client";

import dayjs from "dayjs";

import { getView } from "@/layout/layout-service";
import { useAuth } from "@/modules/auth/auth-context";
import { t } from "@lingui/core/macro";
import { Fragment } from "react";
import { dayjsLocalizer, type CalendarProps } from "react-big-calendar";

export interface CalendarEvent {
  title?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  route?: string;
  resource?: any;
  doctor?: string;
  customerName?: string;
  id?: string;
  groupId?: string;
  bg?: string;
  temp?: boolean;
  borderColor?: string;
}

function Event(props: { event: CalendarEvent }) {
  const { event } = props;
  return (
    <span style={{ fontSize: 12 }}>
      {event.doctor && (
        <Fragment>
          <strong>{event.doctor}</strong>
          <br />
        </Fragment>
      )}

      {event.customerName && (
        <Fragment>
          <strong>{event.customerName}</strong>
          <br />
        </Fragment>
      )}

      <strong>{event.title}</strong>
    </span>
  );
}

export const calendarDayJsLocalizer = dayjsLocalizer(dayjs);

export const useCalendarProps = (): CalendarProps<CalendarEvent> => {
  const auth = useAuth();

  return {
    localizer: calendarDayJsLocalizer,
    step: 15,
    messages: {
      allDay: t`All`,
      previous: "<",
      next: ">",
      today: t`Today`,
      month: t`Month`,
      week: t`Week`,
      day: t`Day`,
      agenda: t`Agenda`,
      date: t`Date`,
      time: t`Time`,
      event: t`Event`,
      noEventsInRange: t`No events in range`,
    },
    components: {
      event: Event,
    },
    formats: {
      timeGutterFormat: (date, culture) => {
        const format = auth.user?.settings.isTwelveHour ? "hh:mm A" : "HH:mm";
        return calendarDayJsLocalizer.format(date, format, culture);
      },
      dayFormat: (date) => {
        if (getView() === "mobile") return dayjs(date).format("dd");
        return dayjs(date).format("dddd");
      },
      eventTimeRangeFormat: (date, culture) => {
        const format = auth.user?.settings.isTwelveHour ? "hh:mm A" : "HH:mm";

        return (
          calendarDayJsLocalizer.format(date.start, format, culture) +
          " - " +
          calendarDayJsLocalizer.format(date.end, format, culture)
        );
      },
    },
  };
};
