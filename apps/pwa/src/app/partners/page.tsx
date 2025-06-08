"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/partners/partner-list").then((mod) => mod.PartnerList));
export default () => <Layout component={Content} />;
