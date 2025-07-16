"use client";

import { Layout, PageProps, renderPage } from "@/layout/layout-page";

const View = renderPage(() =>
  import("@/modules/tasks/views/list/list-task-view").then((res) => res.TasksListView)
);

export default (props: PageProps) => <Layout {...props} component={View} nested />;
