"use client";

import dayjs from "dayjs";

import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { useLang } from "@/modules/lang/lang-context";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { Fragment, useMemo } from "react";
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
  const lang = useLang();
  const layout = useLayout();

  const props = useMemo<CalendarProps<CalendarEvent>>(
    () => ({
      localizer: calendarDayJsLocalizer,
      step: 15,
      messages: {
        allDay: <Trans>All</Trans>,
        previous: "<",
        next: ">",
        today: <Trans>Today</Trans>,
        month: <Trans>Month</Trans>,
        week: <Trans>Week</Trans>,
        day: <Trans>Day</Trans>,
        agenda: <Trans>Agenda</Trans>,
        date: <Trans>Date</Trans>,
        time: <Trans>Time</Trans>,
        event: <Trans>Event</Trans>,
        noEventsInRange: <Trans>No events in range</Trans>,
      },
      components: {
        event: Event,
      },
      formats: {
        timeGutterFormat: (date, culture) => {
          const format = auth.user?.settings?.isTwelveHour ? "hh:mm A" : "HH:mm";
          return calendarDayJsLocalizer.format(date, format, culture);
        },
        dayFormat: (date) => {
          if (layout.view === "mobile") return DateTime.format(date, { weekday: "short" });
          return DateTime.format(date, { locale: lang.locale });
        },
        eventTimeRangeFormat: (date, culture) => {
          const format = auth.user?.settings?.isTwelveHour ? "hh:mm A" : "HH:mm";

          return (
            calendarDayJsLocalizer.format(date.start, format, culture) +
            " - " +
            calendarDayJsLocalizer.format(date.end, format, culture)
          );
        },
      },
    }),
    [auth.user?.settings, layout.view, lang.locale],
  );

  return props;
};
