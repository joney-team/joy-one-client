"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/receipts/receipt-list").then((mod) => mod.ReceiptList));
export default () => <Layout component={Content} />;
