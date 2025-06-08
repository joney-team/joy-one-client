"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/widgets/reports").then((mod) => mod.ReportWidgets));
export default () => <Layout component={Content} />;
