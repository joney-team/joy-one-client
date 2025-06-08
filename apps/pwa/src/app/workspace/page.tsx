"use client";

import { renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/workspaces/workspace").then((mod) => mod.Workspace));
export default () => <Content />;
