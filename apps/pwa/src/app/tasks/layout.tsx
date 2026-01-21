"use client";

import { Layout, PageProps } from "@/layout/layout-page";
import TasksProvider from "@/modules/tasks/tasks-provider";
import TasksViews from "@/modules/tasks/views/task-views";
import { PropsWithChildren } from "react";

const Content = (props: PropsWithChildren) => {
  return <TasksViews>{props.children}</TasksViews>;
};

export default (props: PageProps) => (
  <TasksProvider>
    <Layout {...props} component={Content} />
  </TasksProvider>
);
