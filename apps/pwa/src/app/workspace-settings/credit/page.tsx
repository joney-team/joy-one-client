"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-settings/workspace-setting-credit").then((mod) => mod.WorkspaceSettingCredit)
);
export default () => <Layout component={Content} />;
