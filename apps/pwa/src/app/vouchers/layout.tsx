"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/product-vouchers/product-voucher-layout").then((mod) => mod.ProductVoucherLayout)
);
export default () => <Layout component={Content} />;
