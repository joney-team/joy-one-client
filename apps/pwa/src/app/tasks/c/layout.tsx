"use client";

import { Layout, PageProps, renderPage } from "@/layout/layout-page";

const View = renderPage(() => import("@/modules/tasks/views/calendar").then((res) => res.TasksCalendarView));

export default (props: PageProps) => <Layout {...props} component={View} nested />;
