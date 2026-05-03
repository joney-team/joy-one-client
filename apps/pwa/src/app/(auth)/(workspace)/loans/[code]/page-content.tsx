"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() => import("@/modules/loans/loan-detail").then((mod) => mod.LoanDetail));
