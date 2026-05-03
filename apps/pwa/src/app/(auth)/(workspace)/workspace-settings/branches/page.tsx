"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/workspace-branches/workspace-branch-list").then((mod) => mod.WorkspaceBranchList)
);
