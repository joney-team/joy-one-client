"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/posts/post-new").then((mod) => mod.PostNew));
export default () => <Layout component={Content} />;
