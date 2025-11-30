"use client";

import { useTasks } from "@/modules/tasks/tasks-context";
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
import { useParams, useRouter } from "next/navigation";
import { FC, Fragment, PropsWithChildren, ReactNode, useEffect } from "react";
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

const allTaskViews: {
  [key in TaskView]: {
    icon: Icon;
    name: ReactNode;
  };
} = {
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
  }, [isReady, params, view]);

  return (
    <Fragment>
      <NavigationTabs
        activeTab={view}
        tabs={Object.entries(allTaskViews).map(([key, value]) => ({
          id: key,
          ...value,
        }))}
        onChange={(view) => setView(view as TaskView)}
      />

      {props.children}

      <TasksRealtimeEvents />
      <TaskDetail />
      <BulkTasksActions />
    </Fragment>
  );
};

export default TasksViews;
