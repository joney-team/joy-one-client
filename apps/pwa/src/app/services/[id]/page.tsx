"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/services/service-detail").then((mod) => mod.ServiceDetail));
export default () => <Layout component={Content} />;
