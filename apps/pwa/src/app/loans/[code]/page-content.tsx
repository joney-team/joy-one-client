"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/loans/loan-detail").then((mod) => mod.LoanDetail));
export default () => <Layout component={Content} />;
