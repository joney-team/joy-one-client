"use client";

import { Layout, PageProps, renderPage } from "@/layout/layout-page";

const View = renderPage(() =>
  import("@/modules/tasks/views/list/list-tasks").then((res) => res.ListTasks)
);

export default (props: PageProps) => <Layout {...props} component={View} nested />;
