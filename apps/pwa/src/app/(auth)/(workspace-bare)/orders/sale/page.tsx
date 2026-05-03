"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/orders/orders-sale/orders-sale").then((mod) => mod.OrdersSale)
);
