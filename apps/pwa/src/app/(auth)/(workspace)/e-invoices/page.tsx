"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/plugins/e-invoices/components/e-invoice-list").then((mod) => mod.EInvoiceList),
);
