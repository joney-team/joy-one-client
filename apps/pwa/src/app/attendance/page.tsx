"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/attendance/attendance-list").then((mod) => mod.AttendanceList)
);
export default () => <Layout component={Content} />;
