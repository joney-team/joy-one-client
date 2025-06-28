"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/categories/category-list").then((mod) => mod.CategoryList)
);
export default () => <Layout component={Content} />;
