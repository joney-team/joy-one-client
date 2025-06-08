"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/services/service-list").then((mod) => mod.ServiceList));
export default () => <Layout component={Content} />;
