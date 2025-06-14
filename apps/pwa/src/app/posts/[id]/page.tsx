"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/posts/post-detail").then((mod) => mod.PostDetail)
);
export default () => <Layout component={Content} />;
