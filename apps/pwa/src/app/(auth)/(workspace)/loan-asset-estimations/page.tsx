"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/workspace-settings/workspace-setting-loan-asset-estimations").then(
    (mod) => mod.WorkspaceSettingLoanAssetEstimations
  )
);
