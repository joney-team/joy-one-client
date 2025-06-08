"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/customer-forms/customer-form-list").then((mod) => mod.CustomerFormList)
);
export default () => <Layout component={Content} />;
