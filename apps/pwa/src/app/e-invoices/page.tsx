"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/plugins/e-invoices/components/e-invoice-list").then((mod) => mod.EInvoiceList),
);
export default () => <Layout component={Content} />;
