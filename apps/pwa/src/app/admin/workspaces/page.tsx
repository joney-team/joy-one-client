"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/admin/admin-workspaces").then((mod) => mod.AdminWorkspaces)
);
export default () => <Layout component={Content} />;
