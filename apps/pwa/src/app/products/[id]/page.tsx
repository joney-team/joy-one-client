"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/products/product-detail").then((mod) => mod.ProductDetail));
export default () => <Layout component={Content} />;
