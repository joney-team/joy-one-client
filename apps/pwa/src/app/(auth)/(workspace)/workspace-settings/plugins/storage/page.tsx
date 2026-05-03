"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/plugins/storage/plugin-storage").then((mod) => mod.PluginStorage)
);
