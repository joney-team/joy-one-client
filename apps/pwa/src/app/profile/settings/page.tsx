"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/users/user-profile-settings").then((mod) => mod.UserProfileSettings)
);
export default () => <Layout component={Content} />;
