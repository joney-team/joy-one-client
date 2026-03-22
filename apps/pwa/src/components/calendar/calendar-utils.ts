import { CalendarView } from "@/types";

export function normalizeCalendarView(view: string | null | undefined): CalendarView {
  if (Object.values(CalendarView).includes(view as CalendarView)) {
    return view as CalendarView;
  }

  return CalendarView.MONTH;
}
