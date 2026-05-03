"use client";

import OverlayLoading from "@/components/overlay-loading";
import { useLayout } from "@/layout/layout-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { nonLoading } from "@/utils/non-loading";
import { Stack } from "@mantine/core";
import dynamic from "next/dynamic";

const LayoutWorkspace = dynamic(
  () => import("@/layout/layout-workspace").then((m) => m.LayoutWorkspace),
  { ssr: false, loading: nonLoading },
);

const WorkspaceRequire = dynamic(
  () => import("@/modules/workspaces/workspace-require").then((m) => m.WorkspaceRequire),
  { ssr: false, loading: nonLoading },
);

const WorkspaceRequireBranches = dynamic(
  () =>
    import("@/modules/workspaces/components/workspace-require-branches").then(
      (m) => m.WorkspaceRequireBranches,
    ),
  { ssr: false, loading: nonLoading },
);

const WorkspaceArchived = dynamic(
  () =>
    import("@/modules/workspaces/components/workspace-archived").then((m) => m.WorkspaceArchived),
  { ssr: false, loading: nonLoading },
);

const TriggerConnectMetaPage = dynamic(
  () =>
    import("@/modules/plugins/meta-pages/trigger-connect-meta-page").then(
      (mod) => mod.TriggerConnectMetaPage,
    ),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const layout = useLayout();
  const { isInitialized, member, hasPermission } = useWorkspace();

  if (!isInitialized) return <OverlayLoading />;

  if (!member) return <WorkspaceRequire />;

  const isRequireBranches =
    member.workspace.branches > 0 &&
    !member.workspaceBranches.length &&
    !hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS);

  if (isRequireBranches) return <WorkspaceRequireBranches />;

  if (member.workspace.isArchived) return <WorkspaceArchived />;

  return (
    <>
      <LayoutWorkspace />
      <TriggerConnectMetaPage />
      <Stack
        miw={0}
        mih={0}
        gap={0}
        style={
          layout.view === "mobile"
            ? {
                paddingTop: "var(--app-layout-header-height)",
                paddingBottom: "var(--app-layout-navigation-height)",
              }
            : {
                paddingTop: "var(--app-layout-header-height)",
                paddingLeft: "var(--app-layout-navigation-width)",
              }
        }
      >
        {children}
      </Stack>
    </>
  );
}
