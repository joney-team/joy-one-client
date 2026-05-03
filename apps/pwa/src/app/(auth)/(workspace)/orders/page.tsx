"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/orders/order-list").then((mod) => mod.OrderList)
);
