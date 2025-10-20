"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/receipts/receipt-detail-page").then((mod) => mod.ReceiptDetailPage)
);
export default () => <Layout component={Content} />;
