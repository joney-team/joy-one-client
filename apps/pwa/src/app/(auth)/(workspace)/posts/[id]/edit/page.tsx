"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/posts/post-detail").then((mod) => mod.PostDetail)
);
