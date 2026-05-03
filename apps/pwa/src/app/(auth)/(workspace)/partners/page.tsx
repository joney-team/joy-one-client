"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/modules/partners/partner-list").then((mod) => mod.PartnerList));
