"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/promotions/promotions-list").then((mod) => mod.PromotionsList)
);
