"use client";

import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { nonLoading } from "@/utils/non-loading";
import dynamic from "next/dynamic";

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

export default function WorkspaceBareLayout({ children }: { children: React.ReactNode }) {
  const { isInitialized, member, hasPermission } = useWorkspace();

  if (!isInitialized) return null;

  if (!member) return <WorkspaceRequire />;

  const isRequireBranches =
    member.workspace.branches > 0 &&
    !member.workspaceBranches.length &&
    !hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS);

  if (isRequireBranches) return <WorkspaceRequireBranches />;

  if (member.workspace.isArchived) return <WorkspaceArchived />;

  return <>{children}</>;
}
