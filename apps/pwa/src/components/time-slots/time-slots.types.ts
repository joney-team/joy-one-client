import { ReactNode, RefObject } from "react";

export type TimeInterval = {
  start: string;
  end: string;
  columnIndex: number;
};

export type TimeEvent = TimeInterval & {
  id: string;
  title?: ReactNode;
  data?: unknown;
  background?: string;
};

export type OnSelected = (value: TimeInterval) => void;

export interface TimeSlotsColumn {
  head: ReactNode;
}

export interface TimeSlotsProps {
  cols: TimeSlotsColumn[];
  availableTimeIntervals?: TimeInterval[];
  stepInMinutes?: number;
  onSelect?: OnSelected;
  events?: TimeEvent[];
  onEventClick?: (timeEvent: TimeEvent, element: HTMLDivElement) => void;
  onEventResize?: (timeEvent: TimeEvent) => void;
}

export type TimeSlotDOMRect = Omit<DOMRect, "toJSON">;

export type TimeSlotsContextValue = {
  rootRect: TimeSlotDOMRect;
  headRect: TimeSlotDOMRect;
  rootRef: RefObject<HTMLDivElement | null>;
  headRef: RefObject<HTMLDivElement | null>;
  columnWidth: number;
  stepInMinutes: number;
} & Pick<
  TimeSlotsProps,
  "cols" | "onSelect" | "onEventClick" | "onEventResize" | "availableTimeIntervals"
>;
