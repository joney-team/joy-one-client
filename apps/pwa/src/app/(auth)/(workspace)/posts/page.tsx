"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/modules/posts/posts-list").then((mod) => mod.PostsList));
