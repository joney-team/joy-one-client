"use client";

import { Layout, PageProps, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/coupons/coupons-layout").then((mod) => mod.CouponsLayout));
export default (props: PageProps) => <Layout component={Content} {...props} />;
