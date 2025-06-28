"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/custom-fields/custom-field-list").then((mod) => mod.CustomFieldList)
);
export default () => <Layout component={Content} />;
