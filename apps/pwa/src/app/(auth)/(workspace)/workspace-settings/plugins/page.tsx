"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/workspace-settings/workspace-setting-plugins").then(
    (mod) => mod.WorkspaceSettingPlugins
  )
);
