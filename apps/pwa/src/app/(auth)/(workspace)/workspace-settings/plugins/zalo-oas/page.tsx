"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/plugins/zalo-oas/zalo-oas").then((mod) => mod.PluginZaloOAs)
);
