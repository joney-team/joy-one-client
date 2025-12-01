"use client";

import { Skeleton, Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import { ComponentType, ReactNode, useMemo, type FC } from "react";
import { TaskView } from "./types";

const viewLoader = () => (
  <Stack p={16}>
    <Skeleton height={500} />
  </Stack>
);

const getListTasks = () =>
  dynamic(() => import("./list/list-tasks").then((mod) => mod.ListTasks), {
    ssr: false,
    loading: viewLoader,
  });

const getBoardTasks = () =>
  dynamic(() => import("./board/board-tasks").then((mod) => mod.TasksBoardView), {
    ssr: false,
    loading: viewLoader,
  });

const getGanttTasks = () =>
  dynamic(() => import("./gantt").then((mod) => mod.TasksGantt), {
    ssr: false,
    loading: viewLoader,
  });

const getTimeTrackingsTasks = () =>
  dynamic(() => import("./time-trackings").then((mod) => mod.TasksTimeTrackings), {
    ssr: false,
    loading: viewLoader,
  });

const getCalendarTasks = () =>
  dynamic(() => import("./calendar").then((mod) => mod.TasksCalendarView), {
    ssr: false,
    loading: viewLoader,
  });

const allTaskViews: {
  [key in TaskView]: {
    loader?: () => ComponentType<{ children?: ReactNode | undefined }>;
  };
} = {
  [TaskView.LIST]: { loader: getListTasks },
  [TaskView.BOARD]: { loader: getBoardTasks },
  [TaskView.GANTT]: { loader: getGanttTasks },
  [TaskView.TIME_TRACKINGS]: { loader: getTimeTrackingsTasks },
  [TaskView.CALENDAR]: { loader: getCalendarTasks },
};

export const TaskViewsGateway: FC<{ view: TaskView }> = ({ view }) => {
  // Lazy load component only when view is active, with caching
  const ViewComponent = useMemo(() => {
    const viewConfig = allTaskViews[view];
    if (!viewConfig?.loader) {
      return null;
    }

    // Load and cache the component
    return viewConfig.loader();
  }, [view]);

  if (!ViewComponent) {
    return null;
  }

  return <ViewComponent key={view} />;
};
