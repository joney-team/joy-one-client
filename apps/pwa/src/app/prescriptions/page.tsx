"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/prescriptions/prescription-list").then((mod) => mod.PrescriptionList)
);
export default () => <Layout component={Content} />;
