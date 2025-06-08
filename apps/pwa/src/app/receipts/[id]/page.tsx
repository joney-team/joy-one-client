"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/receipts/receipt-detail").then((mod) => mod.ReceiptDetail));
export default () => <Layout component={Content} props={{ p: 16 }} />;
