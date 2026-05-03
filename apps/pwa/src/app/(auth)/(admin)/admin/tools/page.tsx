"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/admin/admin-tools").then((mod) => mod.AdminTools)
);
