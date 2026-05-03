"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/product-stocks/product-stock-list").then((mod) => mod.ProductStockList)
);
