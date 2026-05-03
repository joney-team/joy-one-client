"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/modules/workspaces/workspace").then((mod) => mod.Workspace));
