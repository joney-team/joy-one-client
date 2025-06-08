"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/product-stocks/product-stock-list").then((mod) => mod.ProductStockList)
);
export default () => <Layout component={Content} />;
