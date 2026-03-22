import { CalendarView } from "@/types";
import { FC } from "react";

export interface CalendarComponents {
  monthDate?: FC<{ date: Date; hovered: boolean; isOutOfRange: boolean }>;
}

export interface CalendarProps {
  initialDate?: Date;
  onChange?: (range: { start: Date; end: Date }) => void;
  renderDay?: (date: Date, hovered: boolean, isOutOfRange: boolean) => React.ReactNode;
  renderDayHead?: (date: Date, hovered: boolean, isOutOfRange: boolean) => React.ReactNode;
  daySlotMinHeight?: number;
  view?: string;
  onViewChange?: (view: CalendarView) => void;
  components?: CalendarComponents;
}

export interface CalendarViewProps extends CalendarProps {
  startAt: Date;
  endAt: Date;
}
