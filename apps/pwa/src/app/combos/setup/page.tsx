"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/product-combos/product-combo-setup").then((mod) => mod.ProductComboSetup)
);
export default () => <Layout component={Content} nested />;
