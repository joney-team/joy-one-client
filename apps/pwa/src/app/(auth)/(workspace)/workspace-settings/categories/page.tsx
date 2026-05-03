"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/categories/category-list").then((mod) => mod.CategoryList)
);
