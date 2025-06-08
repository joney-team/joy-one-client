"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/product-categories/product-category-list").then((mod) => mod.ProductCategoryList)
);
export default () => <Layout component={Content} />;
