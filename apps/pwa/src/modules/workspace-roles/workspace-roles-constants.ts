import { t } from "@lingui/core/macro";
import { WorkspaceSpecialRoleId } from "./workspace-roles-types";

export const workspaceSpecialRoleIds: Record<WorkspaceSpecialRoleId, { name: () => string }> = {
  [WorkspaceSpecialRoleId.OWNER]: { name: () => t`Owner` },
  [WorkspaceSpecialRoleId.ADMIN]: { name: () => t`Admin` },
  [WorkspaceSpecialRoleId.MEMBER]: { name: () => t`Member` },
};
