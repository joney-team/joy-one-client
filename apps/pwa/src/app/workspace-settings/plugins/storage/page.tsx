"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/plugins/storage/plugin-storage").then((mod) => mod.PluginStorage)
);
export default () => <Layout component={Content} />;
