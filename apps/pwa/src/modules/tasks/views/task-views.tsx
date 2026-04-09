"use client";

import { StorageKey } from "@/constants/storage-key";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { Skeleton } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { Icon, IconLayoutKanban, IconList, IconMist, IconStopwatch } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { FC, Fragment, PropsWithChildren, ReactNode, useCallback, useMemo } from "react";
import { TaskContextMenuDropdown } from "../components/task-menu/task-context-menu-dropdown";
import { parseTaskPath, updateTaskPath } from "../tasks-route-helpers";
import { TaskView } from "./types";

const TaskTabActions = dynamic(
  () => import("../components/task-tab-actions").then((mod) => mod.TaskTabActions),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const TaskDetail = dynamic(
  () => import("../components/task-detail/task-detail").then((mod) => mod.TaskDetail),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const NavigationTabs = dynamic(
  () => import("@/components/navigation-tabs").then((mod) => mod.NavigationTabs),
  {
    ssr: false,
    loading: () => <Skeleton height={44} radius={0} />,
  },
);

const TasksRealtimeEvents = dynamic(
  () => import("../tasks-events").then((mod) => mod.TasksEvents),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const TaskViewsGateway = dynamic(
  () => import("./task-views-gateway").then((mod) => mod.TaskViewsGateway),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ContextMenuProvider = dynamic(
  () =>
    import("@/components/context-menu/context-menu-provider").then(
      (mod) => mod.ContextMenuProvider,
    ),
  {
    ssr: false,
    loading: nonLoading,
  },
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
};

const TasksViews: FC<PropsWithChildren> = (props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [, setLocalView] = useLocalStorage<TaskView>({
    key: StorageKey.TASKS_VIEW,
  });

  const { view } = useMemo(() => parseTaskPath(pathname), [pathname]);

  const setView = useCallback(
    (selectedView: string) => {
      setLocalView(selectedView as TaskView);
      router.replace(updateTaskPath({ view: selectedView as TaskView, pathname }));
    },
    [router, pathname],
  );

  return (
    <Fragment>
      {props.children}

      <ContextMenuProvider dropdown={TaskContextMenuDropdown}>
        <NavigationTabs
          activeTab={view}
          tabs={Object.entries(allTaskViews).map(([key, value]) => ({
            id: key,
            icon: value.icon,
            name: value.name,
          }))}
          onChange={setView}
          rightSection={TaskTabActions}
        />
        <TaskViewsGateway view={view} />
        <TaskDetail />
        <TasksRealtimeEvents />
      </ContextMenuProvider>
    </Fragment>
  );
};

export default TasksViews;
