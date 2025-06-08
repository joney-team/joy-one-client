"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/orders/order-list").then((mod) => mod.OrderList));
export default () => <Layout component={Content} />;
