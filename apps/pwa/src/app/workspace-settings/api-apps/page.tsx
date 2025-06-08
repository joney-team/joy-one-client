"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-api-apps/workspace-api-app-list").then((mod) => mod.WorkspaceApiAppList)
);
export default () => <Layout component={Content} />;
