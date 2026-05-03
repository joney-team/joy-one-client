"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/admin/admin-workspaces").then((mod) => mod.AdminWorkspaces)
);
