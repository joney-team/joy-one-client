"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("@/modules/posts/posts-list").then((mod) => mod.PostsList));
export default () => <Layout component={Content} />;
