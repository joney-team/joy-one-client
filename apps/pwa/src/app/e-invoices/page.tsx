"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/e-invoices/e-invoice-list").then((mod) => mod.EInvoiceList)
);
export default () => <Layout component={Content} />;
