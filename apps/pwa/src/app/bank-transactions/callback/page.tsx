"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/bank-transactions/bank-transaction-callback").then((mod) => mod.BankTransactionCallback)
);
export default () => <Layout component={Content} />;
