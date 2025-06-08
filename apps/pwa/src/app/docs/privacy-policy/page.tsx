"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-settings/workspace-setting-term-policy-editor").then(
    (mod) => mod.WorkspaceSettingTermsPoliciesEditor
  )
);
export default () => <Layout component={Content} props={{ doc: "privacy-policy" }} />;
