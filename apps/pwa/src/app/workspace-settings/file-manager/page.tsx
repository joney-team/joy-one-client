"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-settings/workspace-setting-file-manager").then(
    (mod) => mod.WorkspaceFileManager
  )
);
export default () => <Layout component={Content} />;
