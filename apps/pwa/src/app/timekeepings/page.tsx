"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/hrm-timekeepings/hrm-timekeeping-list").then((mod) => mod.HrmTimekeepingList)
);

export default () => <Layout component={Content} />;
