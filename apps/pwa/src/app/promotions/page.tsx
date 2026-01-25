"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/promotions/promotions-list").then((mod) => mod.PromotionsList)
);
export default () => <Layout component={Content} />;
