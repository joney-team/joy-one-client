"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/workspace-roles/workspace-role-list").then((mod) => mod.WorkspaceRoleList)
);
