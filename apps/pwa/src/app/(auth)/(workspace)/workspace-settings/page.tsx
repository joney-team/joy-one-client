"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/workspace-settings/workspace-settings").then((mod) => mod.WorkspaceSettings)
);
