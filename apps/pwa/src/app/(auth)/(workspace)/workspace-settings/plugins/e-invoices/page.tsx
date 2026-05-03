"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/plugins/e-invoices/plugin-e-invoice-provider-list").then(
    (mod) => mod.PluginEInvoiceProviderList
  )
);
