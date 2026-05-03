"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/workspace-settings/components/workspace-setting-app").then(
    (mod) => mod.WorkspaceAppSettingsPage,
  ),
);
