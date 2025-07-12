"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/plugins/zalo-oas/zalo-oas").then((mod) => mod.PluginZaloOAs)
);
export default () => <Layout component={Content} />;
