"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/modules/services/service-list").then((mod) => mod.ServiceList));
