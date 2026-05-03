"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/custom-fields/custom-field-list").then((mod) => mod.CustomFieldList)
);
