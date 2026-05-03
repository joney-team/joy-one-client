"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/attendance/attendance-list").then((mod) => mod.AttendanceListPage),
);
