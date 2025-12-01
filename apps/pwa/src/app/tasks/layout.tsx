"use client";

import { Layout, PageProps } from "@/layout/layout-page";
import { ModalTaskTimeTracking } from "@/modules/tasks/modals/modal-task-time-tracking";
import TaskHistoriesProvider from "@/modules/tasks/task-history-provider";
import TasksProvider from "@/modules/tasks/tasks-provider";
import TasksViews from "@/modules/tasks/views/task-views";
import { PropsWithChildren } from "react";

const Content = (props: PropsWithChildren) => {
  return <TasksViews>{props.children}</TasksViews>;
};

export default (props: PageProps) => (
  <TasksProvider>
    <TaskHistoriesProvider>
      <Layout {...props} component={Content} />
      <ModalTaskTimeTracking />
    </TaskHistoriesProvider>
  </TasksProvider>
);
