"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/customer-kycs/customer-kyc-list").then((mod) => mod.CustomerKycList)
);
