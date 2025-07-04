"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/promotions/promostion-list").then((mod) => mod.PromostionList)
);
export default () => <Layout component={Content} />;
