import { NavigationTabs } from "@/components/navigation-tabs";
import { useTasks } from "@/modules/tasks/tasks-context";
import {
  Icon,
  IconCalendar,
  IconLayoutKanban,
  IconList,
  IconMist,
  IconStopwatch,
} from "@tabler/icons-react";
import { FC, Fragment, PropsWithChildren, useEffect } from "react";
import { BulkTasksActions } from "../components/bulk-tasks-actions";
import { TaskDetail } from "../task-detail";
import { TaskView } from "./types";

const allTaskViews: {
  [key in TaskView]: {
    icon: Icon;
    name: string;
  };
} = {
  [TaskView.LIST]: {
    icon: IconList,
    name: "list",
  },
  [TaskView.BOARD]: {
    icon: IconLayoutKanban,
    name: "board",
  },
  [TaskView.GANTT]: {
    icon: IconMist,
    name: "gantt",
  },
  [TaskView.TIME_TRACKINGS]: {
    icon: IconStopwatch,
    name: "time_trackings",
  },
  [TaskView.CALENDAR]: {
    icon: IconCalendar,
    name: "calendar",
  },
};

const TasksViews: FC<PropsWithChildren> = (props) => {
  const { view, setView, views, router, getSelectedView, params } = useTasks();

  const redirecting = () => {
    const selectedView = getSelectedView();
    const folderTagSlug = params.slug || "d";
    const taskCode = params.code;

    if (router.pathname === "/tasks") {
      return router.replace(`/tasks/${selectedView}/${folderTagSlug}`, { scroll: false });
    }

    if (params.code && !params.slug) {
      return router.replace(`/tasks/${selectedView}/${folderTagSlug}/${taskCode}`, {
        scroll: false,
      });
    }
  };

  useEffect(() => {
    redirecting();
  }, [router.pathname]);

  return (
    <Fragment>
      <NavigationTabs
        activeTab={view}
        tabs={views.map((key) => ({
          id: key,
          name: `tasks_view_${allTaskViews[key as TaskView]?.name}`,
          icon: allTaskViews[key as TaskView]?.icon,
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
