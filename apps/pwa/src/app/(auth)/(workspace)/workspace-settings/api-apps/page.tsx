"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/workspace-api-apps/workspace-api-app-list").then((mod) => mod.WorkspaceApiAppList)
);
