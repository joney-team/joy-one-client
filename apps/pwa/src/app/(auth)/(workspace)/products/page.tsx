"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/modules/products/product-list").then((mod) => mod.ProductList));
