"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/workspace-settings/workspace-setting-loan-asset-estimations").then(
    (mod) => mod.WorkspaceSettingLoanAssetEstimations
  )
);

export default () => <Layout component={Content} />;
