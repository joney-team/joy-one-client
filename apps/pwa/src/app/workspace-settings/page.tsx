"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-settings/workspace-settings").then((mod) => mod.WorkspaceSettings)
);

export default () => <Layout component={Content} />;
