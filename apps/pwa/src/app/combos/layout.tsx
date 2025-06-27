"use client";

import { Layout, PageProps, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/product-combos/product-combos-layout").then((mod) => mod.ProductComboLayout)
);
export default (props: PageProps) => <Layout component={Content} {...props} isPageLayout />;
