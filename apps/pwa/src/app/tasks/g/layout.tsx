"use client";

import { Layout, PageProps, renderPage } from "@/layout/layout-page";

const View = renderPage(() => import("@/modules/tasks/views/gantt").then((res) => res.TasksGanttView));

export default (props: PageProps) => <Layout {...props} component={View} nested />;
