"use client";

import { Layout, PageProps, renderPage } from "@/layout/layout-page";

const View = renderPage(() => import("@/modules/tasks/views/time-trackings").then((res) => res.TasksTimeTrackings));

export default (props: PageProps) => <Layout {...props} component={View} nested />;
