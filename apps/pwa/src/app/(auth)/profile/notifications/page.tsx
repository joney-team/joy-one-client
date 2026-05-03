"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/users/user-profile-notifications").then((mod) => mod.UserProfileNotifications)
);
