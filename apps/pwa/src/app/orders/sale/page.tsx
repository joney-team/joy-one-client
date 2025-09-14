"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/orders/order-sale/order-sale").then((mod) => mod.OrderSale)
);
export default () => <Layout component={Content} />;
