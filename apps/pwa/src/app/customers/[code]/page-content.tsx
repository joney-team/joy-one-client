"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/customers/customer-detail/customer-detail").then((mod) => mod.CustomerDetail)
);
export default () => <Layout component={Content} />;
