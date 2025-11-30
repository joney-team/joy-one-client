"use client";

import { Layout, PageProps, renderPage } from "@/layout/layout-page";

const View = renderPage(() =>
  import("@/modules/tasks/views/board/board-tasks").then((res) => res.TasksBoardView)
);

export default (props: PageProps) => <Layout {...props} component={View} nested />;
