"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-settings/workspace-setting-ai-assistants").then((mod) => mod.WorkspaceSettingAiAssistants)
);

export default () => <Layout component={Content} />;
