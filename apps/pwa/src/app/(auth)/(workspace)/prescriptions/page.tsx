"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/prescriptions/prescription-list").then((mod) => mod.PrescriptionList)
);
