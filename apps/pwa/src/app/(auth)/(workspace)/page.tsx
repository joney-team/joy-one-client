"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/modules/dashboard/dashboard").then((mod) => mod.AppDashboard));
