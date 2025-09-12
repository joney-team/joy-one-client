"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/admin/admin-tools").then((mod) => mod.AdminTools)
);
export default () => <Layout component={Content} />;
