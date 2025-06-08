"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-settings/workspace-setting-hrm-timekeepings").then(
    (mod) => mod.WorkspaceSettingHrmTimekeepings
  )
);

export default () => <Layout component={Content} />;
