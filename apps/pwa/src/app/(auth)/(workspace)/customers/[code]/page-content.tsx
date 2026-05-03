"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/customers/customer-detail/customer-detail").then((mod) => mod.CustomerDetail)
);
