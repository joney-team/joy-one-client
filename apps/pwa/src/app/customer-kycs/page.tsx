"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/customer-kycs/customer-kyc-list").then((mod) => mod.CustomerKycList)
);
export default () => <Layout component={Content} />;
