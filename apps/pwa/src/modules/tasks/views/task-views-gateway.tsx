"use client";

import { Skeleton, Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import { ComponentType, ReactNode, useEffect, useMemo, type FC } from "react";
import { TaskView } from "./types";
import { useParams, usePathname, useRouter } from "next/navigation";
import { updateTaskPath } from "../tasks-route-helpers";

const viewLoader = () => (
  <Stack p={16}>
    <Skeleton mih={500} w="100%" />
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
  dynamic(() => import("./gantt/gantt-tasks").then((mod) => mod.GanttTasks), {
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
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ slug: string; code: string }>();

  // Auto redirect to the correct view
  useEffect(() => {
    if (location.pathname === "/tasks") {
      return router.replace(updateTaskPath({ view }));
    } else if (view) {
      if (!Object.values(TaskView).includes(view as TaskView)) {
        // return router.replace(updateTaskPath({ code: params.code, view: TaskView.LIST, pathname }));
        console.log("view", view);
        return;
      }

      if (params.code && !params.slug) {
        return router.replace(updateTaskPath({ slug: params.slug, code: params.code, pathname }));
      }
    }
  }, [params, view, router, pathname]);

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
