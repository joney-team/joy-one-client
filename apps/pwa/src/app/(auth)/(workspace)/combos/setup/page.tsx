"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/product-combos/product-combo-setup").then((mod) => mod.ProductComboSetup)
);
