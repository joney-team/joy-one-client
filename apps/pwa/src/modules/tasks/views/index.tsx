"use client";

import { NavigationTabs } from "@/components/navigation-tabs";
import { useTasks } from "@/modules/tasks/tasks-context";
import { Trans } from "@lingui/react/macro";
import {
  Icon,
  IconCalendar,
  IconLayoutKanban,
  IconList,
  IconMist,
  IconStopwatch,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { FC, Fragment, PropsWithChildren, ReactNode, useEffect } from "react";
import { BulkTasksActions } from "../components/bulk-tasks-actions";
import { TaskDetail } from "../task-detail";
import { TaskView } from "./types";

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
    if (isReady) {
      if (location.pathname === "/tasks") {
        return router.replace(`/tasks/${view}/${activatedFolder?.slug || "d"}`);
      }

      if (params.code && !params.slug) {
        return router.replace(`/tasks/${view}/${params.slug || "d"}/${params.code}`);
      }
    }
  }, [isReady, params]);

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

      <TaskDetail />
      <BulkTasksActions />
    </Fragment>
  );
};

export default TasksViews;
