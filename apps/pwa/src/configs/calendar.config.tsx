"use client";

import dayjs from "dayjs";

import { dayjsLocalizer, type CalendarProps } from "react-big-calendar";
import { getView } from "@/layout/layout-service";
import { LangState } from "@/modules/lang/lang-types";
import { getGlobal } from "@/global";
import { Fragment } from "react";

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

export const calendarProps: CalendarProps<CalendarEvent> = {
  localizer: calendarDayJsLocalizer,
  step: 15,
  messages: {
    allDay: "Tất cả",
    previous: "<",
    next: ">",
    today: "Hôm nay",
    month: "Tháng",
    week: "Tuần",
    day: "Ngày",
    agenda: "Danh sách",
    date: "Date",
    time: "Thời gian",
    event: "Nội dung",
    noEventsInRange: "Không có bookings nào vào khung thời gian này",
  },
  components: {
    event: Event,
  },
  formats: {
    timeGutterFormat: (date, culture) => {
      const global = getGlobal();
      const langState = global._langState as LangState | undefined;
      if (langState?.isTwelveHour) return calendarDayJsLocalizer.format(date, "hh:mm A", culture);
      return calendarDayJsLocalizer.format(date, "HH:mm", culture);
    },
    dayFormat: (date) => {
      if (getView() === "mobile") return dayjs(date).format("dd");
      return dayjs(date).format("dddd");
    },
    eventTimeRangeFormat: (date, culture) => {
      const global = getGlobal();
      const langState = global._langState as LangState | undefined;
      const format = langState?.isTwelveHour ? "hh:mm A" : "HH:mm";

      return (
        calendarDayJsLocalizer.format(date.start, format, culture) +
        " - " +
        calendarDayJsLocalizer.format(date.end, format, culture)
      );
    },
  },
};
