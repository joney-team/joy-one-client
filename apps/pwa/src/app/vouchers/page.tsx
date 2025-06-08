"use client";

import { renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/product-vouchers/product-voucher-list").then((mod) => mod.ProductVoucherList)
);
export default () => <Content />;
