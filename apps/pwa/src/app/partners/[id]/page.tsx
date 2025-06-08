"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/partners/partner-detail").then((mod) => mod.PartnerDetail));
export default () => <Layout component={Content} />;
