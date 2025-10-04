"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/admin/admin-playground").then((mod) => mod.AdminPlayground)
);
export default () => <Layout component={Content} />;
