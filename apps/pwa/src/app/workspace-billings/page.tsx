"use client";

import { renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-billings/workspace-billing-list").then((mod) => mod.WorkspaceBillingList)
);
export default () => <Content />;
