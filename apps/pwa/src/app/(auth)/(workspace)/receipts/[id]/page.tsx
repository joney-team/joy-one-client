"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/receipts/receipt-detail-page").then((mod) => mod.ReceiptDetailPage)
);
