"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-settings/workspace-setting-plugins").then((mod) => mod.WorkspaceSettingPlugins)
);

export default () => <Layout component={Content} />;
