"use client";

import { useTasks } from "@/modules/tasks/tasks-context";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { Skeleton, Stack } from "@mantine/core";
import {
  Icon,
  IconCalendar,
  IconLayoutKanban,
  IconList,
  IconMist,
  IconStopwatch,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import {
  ComponentType,
  FC,
  Fragment,
  PropsWithChildren,
  ReactNode,
  Suspense,
  useEffect,
  useMemo,
} from "react";
import { BulkTasksActions } from "../components/bulk-tasks-actions";
import { TaskView } from "./types";

const TaskDetail = dynamic(() => import("../task-detail").then((mod) => mod.TaskDetail), {
  ssr: false,
  loading: nonLoading,
});

const NavigationTabs = dynamic(
  () => import("@/components/navigation-tabs").then((mod) => mod.NavigationTabs),
  {
    ssr: false,
    loading: () => <Skeleton height={44} radius={0} />,
  }
);

const TasksRealtimeEvents = dynamic(
  () => import("../tasks-realtime-events").then((mod) => mod.TasksRealtimeEvents),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const viewLoader = () => (
  <Stack p={16}>
    <Skeleton height={500} />
  </Stack>
);

// Lazy load factory functions - only create dynamic imports when needed
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
    icon: Icon;
    name: ReactNode;
    loader?: () => ComponentType<{
      children?: ReactNode | undefined;
    }>;
  };
} = {
  [TaskView.LIST]: {
    icon: IconList,
    name: <Trans>List</Trans>,
    loader: getListTasks,
  },
  [TaskView.BOARD]: {
    icon: IconLayoutKanban,
    name: <Trans>Board</Trans>,
    loader: getBoardTasks,
  },
  [TaskView.GANTT]: {
    icon: IconMist,
    name: <Trans>Gantt</Trans>,
    loader: getGanttTasks,
  },
  [TaskView.TIME_TRACKINGS]: {
    icon: IconStopwatch,
    name: <Trans>Time trackings</Trans>,
    loader: getTimeTrackingsTasks,
  },
  [TaskView.CALENDAR]: {
    icon: IconCalendar,
    name: <Trans>Calendar</Trans>,
    loader: getCalendarTasks,
  },
};

const TasksViews: FC<PropsWithChildren> = (props) => {
  const router = useRouter();
  const params = useParams<{ slug: string; code: string }>();
  const { view, setView, activatedFolder, isReady } = useTasks();

  // Auto redirect to the correct view
  useEffect(() => {
    if (isReady && view) {
      if (location.pathname === "/tasks") {
        return router.replace(`/tasks/${view}/${activatedFolder?.slug || "d"}`);
      }

      if (params.code && !params.slug) {
        return router.replace(`/tasks/${view}/${params.slug || "d"}/${params.code}`);
      }
    }
  }, [isReady, params, view, activatedFolder?.slug, router]);

  // Lazy load component only when view is active, with caching
  const ViewComponent = useMemo(() => {
    const viewConfig = allTaskViews[view];
    if (!viewConfig?.loader) {
      return null;
    }

    // Load and cache the component
    const Component = viewConfig.loader();
    return Component;
  }, [view]);

  return (
    <Fragment>
      <NavigationTabs
        activeTab={view}
        tabs={Object.entries(allTaskViews).map(([key, value]) => ({
          id: key,
          icon: value.icon,
          name: value.name,
        }))}
        onChange={(view) => setView(view as TaskView)}
      />

      {props.children}

      {ViewComponent && (
        <Suspense fallback={<Skeleton height={300} />}>
          <ViewComponent />
        </Suspense>
      )}

      <TasksRealtimeEvents />
      <TaskDetail />
      <BulkTasksActions />
    </Fragment>
  );
};

export default TasksViews;
