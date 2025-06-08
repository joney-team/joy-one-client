"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("./page-content"));
export default () => <Layout component={Content} />;
