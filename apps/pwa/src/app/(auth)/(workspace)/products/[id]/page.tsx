"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/products/product-detail").then((mod) => mod.ProductDetail)
);
