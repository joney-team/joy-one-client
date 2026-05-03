"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/modules/receipts/receipt-list").then((mod) => mod.ReceiptList));
