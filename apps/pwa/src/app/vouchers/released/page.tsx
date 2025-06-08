"use client";

import { renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/product-vouchers/released-product-voucher-list").then((mod) => mod.ReleasedProductVoucherList)
);
export default () => <Content />;
