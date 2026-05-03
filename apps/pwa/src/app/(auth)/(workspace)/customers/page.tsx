"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/customers/customer-list").then((mod) => mod.CustomerList)
);
