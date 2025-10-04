"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/orders/orders-sale/orders-sale").then((mod) => mod.OrdersSale)
);
export default () => <Layout component={Content} />;
