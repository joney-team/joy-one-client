"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/customer-forms/customer-form-list").then((mod) => mod.CustomerFormList)
);
