"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-roles/workspace-role-list").then((mod) => mod.WorkspaceRoleList)
);

export default () => <Layout component={Content} />;
