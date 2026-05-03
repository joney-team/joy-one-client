"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/widgets/reports").then((mod) => mod.ReportWidgets));
