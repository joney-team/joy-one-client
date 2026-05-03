"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/files/files-manager").then((mod) => mod.FilesManager)
);
