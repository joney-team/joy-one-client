"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/modules/posts/post-new").then((mod) => mod.PostNew));
