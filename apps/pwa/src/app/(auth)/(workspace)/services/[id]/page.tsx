"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/modules/services/service-detail").then((mod) => mod.ServiceDetail));
