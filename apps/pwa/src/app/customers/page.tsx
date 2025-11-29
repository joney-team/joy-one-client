"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/customers/customer-list").then((mod) => mod.CustomerList)
);
export default () => <Layout component={Content} />;
