"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/products/product-list").then((mod) => mod.ProductList));
export default () => <Layout component={Content} />;
