"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-branches/workspace-branch-list").then((mod) => mod.WorkspaceBranchList)
);
export default () => <Layout component={Content} />;
