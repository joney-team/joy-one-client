import { DateTimeUnit } from "@joy-one-client/utils/date-time";

import { SetStateAction } from "react";

import { Dispatch } from "react";
import { getDateRangeBreakdown } from "./gantt-tasks-utils";

export type ScrollDirection = "vertical" | "horizontal";

export interface GanttState {
  unit: DateTimeUnit;
  fromDate: Date;
  toDate: Date;
  isShowTaskstatusColor?: boolean;
  isShowEstimatedTime?: boolean;
  dividerPosition?: number;
}

export type GanttLayout = "sidebar" | "body" | "sidebar-head" | "body-head";

export type ScrollToDateArgs = (
  args: (Date | number) | { date: Date | number; offset?: number; behavior?: "smooth" | "instant" }
) => void;

export type UseGantt = {
  state: GanttState;
  setState: Dispatch<SetStateAction<GanttState>>;
  changeColumnSize: (size: number) => void;
  scrollToDate: ScrollToDateArgs;
  range: ReturnType<typeof getDateRangeBreakdown>;
  columns: { start: Date; end: Date }[];
  isGrabbing: boolean;
};
