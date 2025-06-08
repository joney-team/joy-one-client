"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-settings/workspace-setting-message-hubs").then((mod) => mod.WorkspaceSettingMessageHubs)
);

export default () => <Layout component={Content} />;
