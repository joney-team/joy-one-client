import { DateTimeUnit } from "@joy-one-client/utils/date-time";

import { SetStateAction } from "react";

import { Dispatch } from "react";
import { getDateRangeBreakdown } from "./gantt-tasks-utils";

export type ScrollDirection = "vertical" | "horizontal";

export interface GanttState {
  unit: DateTimeUnit;
  fromDate: Date;
  toDate: Date;
  displayTaskStatusColor?: boolean;
  dividerPosition?: number;
  isHideEstimateTime?: boolean;
}

export interface GanttTaskState {
  hovered?: boolean;
  isShowSubTasks?: boolean;
  isOutSideBody?: boolean;
}

export interface GanttTaskStates {
  [taskId: string]: GanttTaskState;
}

export interface GanttFolderState {
  isCollapsed?: boolean;
}

export interface GanttFolderStates {
  [folderId: string]: GanttFolderState;
}

export type GanttLayout = "sidebar" | "body" | "sidebar-head" | "body-head";

export type ScrollToDateArgs = (
  args: (Date | number) | { date: Date | number; offset?: number; behavior?: "smooth" | "instant" }
) => void;

export type UseGantt = {
  state: GanttState;
  setState: (state: GanttState) => void;
  dividerPosition: number;
  changeColumnSize: (size: number) => void;
  sidebarWidth: number;
  setSidebarWidth: Dispatch<SetStateAction<number>>;
  sidebarContentWidth: number;
  setSidebarContentWidth: Dispatch<SetStateAction<number>>;
  sidebarContentScrollPosition: number;
  setSidebarContentScrollPosition: Dispatch<SetStateAction<number>>;
  scrollToDate: ScrollToDateArgs;
  toggleSisplayTaskStatusColor: () => void;
  setActiveLayout: (layout?: GanttLayout) => void;
  activeLayout: GanttLayout | null;
  scrollDirection: ScrollDirection | null;
  isScrolling: boolean;
  range: ReturnType<typeof getDateRangeBreakdown>;
  columns: { start: Date; end: Date }[];
  isGrabbing: boolean;
};
