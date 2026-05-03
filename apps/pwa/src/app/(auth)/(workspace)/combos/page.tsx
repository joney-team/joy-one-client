"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/product-combos/product-combo-list").then((mod) => mod.ProductComboList)
);
