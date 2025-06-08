import { TaskStatus } from "@/modules/tasks/tasks-types";

import { TaskEntity } from "@/modules/tasks/tasks-types";

import { TagEntity } from "@/modules/tags/tags-types";

import { SetStateAction } from "react";

import { Dispatch } from "react";

import { RefObject } from "react";

export type ScrollDirection = 'vertical' | 'horizontal';
export type Pointer = 'sidebar' | 'body' | null;

export interface GanttState {
  fromDate: Date;
  toDate: Date;
  columnSize: number;
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

export type GanttLayout = 'sidebar' | 'body' | 'sidebar-head' | 'body-head';

export type ScrollToDateArgs = (args: (Date | number) | { date: Date | number, offset?: number, behavior?: 'smooth' | 'instant' }) => void

export type UseGantt = {
  state: GanttState;
  setState: (state: GanttState) => void;
  dividerPosition: number;
  sidebarRef: RefObject<HTMLDivElement | null>;
  contentBodyRef: RefObject<HTMLDivElement | null>;
  changeColumnSize: (size: number) => void;
  tasksState: GanttTaskStates;
  setTaskState: (taskId: string, state?: GanttTaskState) => void;
  foldersState: GanttFolderStates;
  setFolderState: (folderId: string, state?: GanttFolderState) => void;
  sidebarWidth: number;
  setSidebarWidth: Dispatch<SetStateAction<number>>;
  sidebarContentWidth: number;
  setSidebarContentWidth: Dispatch<SetStateAction<number>>;
  sidebarContentScrollPosition: number;
  setSidebarContentScrollPosition: Dispatch<SetStateAction<number>>;
  scrollToDate: ScrollToDateArgs;
  tasks: TaskEntity[];
  activatedTagFolder?: TagEntity;
  tagFolders: TagEntity[];
  dates: Date[];
  toggleSisplayTaskStatusColor: () => void;
  statuses: TaskStatus[];
  setActiveLayout: (layout?: GanttLayout) => void;
  activeLayout: GanttLayout | null;
  scrollDirection: ScrollDirection | null;
  isScrolling: boolean;
}