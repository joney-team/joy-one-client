"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/plugins/e-invoices/plugin-e-invoice-provider-list").then(
    (mod) => mod.PluginEInvoiceProviderList
  )
);

export default () => <Layout component={Content} />;
