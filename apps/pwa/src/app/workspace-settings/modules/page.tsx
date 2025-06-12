"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspaces/workspace-module-setup").then((mod) => mod.WorkspaceModuleSetup)
);
export default () => <Layout component={Content} />;
