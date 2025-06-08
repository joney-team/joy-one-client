"use client";

import { renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/customer-forms/customer-form-register").then((mod) => mod.CustomerFormRegister)
);
export default () => <Content />;
