"use client";

import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { Skeleton } from "@mantine/core";
import {
  Icon,
  IconCalendar,
  IconLayoutKanban,
  IconList,
  IconMist,
  IconStopwatch,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useParams, usePathname, useRouter } from "next/navigation";
import { FC, Fragment, PropsWithChildren, ReactNode, useEffect, useMemo } from "react";
import { BulkTasksActions } from "../components/bulk-tasks-actions";
import { parseTaskPath, updateTaskPath } from "../tasks-route-helpers";
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

const TaskViewGateway = dynamic(
  () => import("./task-views-gateway").then((mod) => mod.TaskViewsGateway),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const TaskMenuDropdown = dynamic(
  () => import("../modules/task-menu/task-menu-dropdown").then((mod) => mod.TaskMenuDropdown),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const allTaskViews: Record<TaskView, { icon: Icon; name: ReactNode }> = {
  [TaskView.LIST]: {
    icon: IconList,
    name: <Trans>List</Trans>,
  },
  [TaskView.BOARD]: {
    icon: IconLayoutKanban,
    name: <Trans>Board</Trans>,
  },
  [TaskView.GANTT]: {
    icon: IconMist,
    name: <Trans>Gantt</Trans>,
  },
  [TaskView.TIME_TRACKINGS]: {
    icon: IconStopwatch,
    name: <Trans>Time trackings</Trans>,
  },
  [TaskView.CALENDAR]: {
    icon: IconCalendar,
    name: <Trans>Calendar</Trans>,
  },
};

const TasksViews: FC<PropsWithChildren> = (props) => {
  const router = useRouter();
  const pathname = usePathname();

  const { view } = useMemo(() => parseTaskPath(pathname), [pathname]);
  const params = useParams<{ slug: string; code: string }>();

  // Auto redirect to the correct view
  useEffect(() => {
    if (view) {
      if (location.pathname === "/tasks") {
        return router.replace(`/tasks/${view}/d`);
      }

      if (params.code && !params.slug) {
        return router.replace(updateTaskPath(pathname, { slug: params.slug, code: params.code }));
      }
    }
  }, [params, view, router]);

  const setView = (selectedView: string) => {
    router.replace(updateTaskPath(pathname, { view: selectedView as TaskView }));
  };

  return (
    <Fragment>
      <NavigationTabs
        activeTab={view}
        tabs={Object.entries(allTaskViews).map(([key, value]) => ({
          id: key,
          icon: value.icon,
          name: value.name,
        }))}
        onChange={setView}
      />

      {props.children}

      <TaskViewGateway view={view} />
      <TasksRealtimeEvents />
      <TaskDetail />
      <BulkTasksActions />
      <TaskMenuDropdown />
    </Fragment>
  );
};

export default TasksViews;
