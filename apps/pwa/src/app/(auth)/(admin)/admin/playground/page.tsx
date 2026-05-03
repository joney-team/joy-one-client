"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/admin/admin-playground").then((mod) => mod.AdminPlayground)
);
