"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/attendance/attendance-setting").then((mod) => mod.AttendanceSetting),
);
export default () => <Layout component={Content} />;
