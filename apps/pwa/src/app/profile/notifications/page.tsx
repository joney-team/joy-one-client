"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/users/user-profile-notifications").then((mod) => mod.UserProfileNotifications)
);
export default () => <Layout component={Content} />;
