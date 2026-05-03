"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/modules/orders/order-detail").then((mod) => mod.OrderDetail));
