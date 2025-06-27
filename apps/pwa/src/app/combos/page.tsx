"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/product-combos/product-combo-list").then((mod) => mod.ProductComboList)
);
export default () => <Layout component={Content} nested />;
