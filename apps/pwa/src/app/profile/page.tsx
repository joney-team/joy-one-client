"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/users/user-profile").then((mod) => mod.Profile));
export default () => <Layout component={Content} />;
