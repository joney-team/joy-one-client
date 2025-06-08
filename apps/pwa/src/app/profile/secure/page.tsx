"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/users/user-profile-secure").then((mod) => mod.UserProfileSecure));
export default () => <Layout component={Content} />;
