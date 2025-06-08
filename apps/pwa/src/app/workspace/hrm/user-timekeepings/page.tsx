"use client";

import { renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/hrm-timekeepings/hrm-member-hrm-timekeepings").then((mod) => mod.HrmMemberTimekeepings)
);
export default () => <Content />;
