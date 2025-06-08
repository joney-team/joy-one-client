"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/dashboard/dashboard").then((mod) => mod.AppDashboard));
export default () => <Layout component={Content} />;
