import { useLingui } from "@lingui/react/macro";
import { WorkspaceDefaultRoleId } from "../workspace-roles-types";
import { workspaceDefaultRoles } from "../workspace-roles-constants";

export const useNormalizeRoles = () => {
  const { t } = useLingui();

  return {
    normalizeRole: <T extends { _id: string; name: string }>(role: T) => {
      if (Object.values(WorkspaceDefaultRoleId).includes(role._id as WorkspaceDefaultRoleId)) {
        const roleName = workspaceDefaultRoles[role._id as WorkspaceDefaultRoleId].name;
        return {
          ...role,
          name: t(roleName),
        };
      }

      return role;
    },
  };
};
