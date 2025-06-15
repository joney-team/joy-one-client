"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/users/components/user-profile-information").then(
    (mod) => mod.UserProfileInformation
  )
);
export default () => <Layout component={Content} />;
