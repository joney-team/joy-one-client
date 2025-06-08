"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/orders/order-detail").then((mod) => mod.OrderDetail));
export default () => <Layout component={Content} />;
