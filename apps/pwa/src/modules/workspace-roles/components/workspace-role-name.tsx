"use client";

import { WorkspaceMemberFragment } from "@/modules/workspace-members/graphql/fragmentWorkspaceMember.graphql";
import { useLingui } from "@lingui/react/macro";
import { FC, useMemo } from "react";
import { WorkspaceRoleFragment } from "../graphql/fragmentWorkspaceRole.graphql";
import { workspaceSpecialRoleIds } from "../workspace-roles-constants";
import { WorkspaceDefaultRoleId } from "../workspace-roles-types";

export const WorkspaceRoleName: FC<{ role: Pick<WorkspaceRoleFragment, "name" | "_id"> }> = ({
  role,
}) => {
  const { t } = useLingui();

  if (Object.values(WorkspaceDefaultRoleId).includes(role._id as WorkspaceDefaultRoleId)) {
    return t(workspaceSpecialRoleIds[role._id as WorkspaceDefaultRoleId].name);
  }

  return role.name;
};

export const WorkspaceMemberRoleName: FC<{
  member: Pick<WorkspaceMemberFragment, "memberId" | "roles">;
}> = ({ member }) => {
  const { t } = useLingui();

  const roles = useMemo(() => {
    const getWorkspaceRoleName = (role: Pick<WorkspaceRoleFragment, "name" | "_id">) => {
      if (Object.values(WorkspaceDefaultRoleId).includes(role._id as WorkspaceDefaultRoleId)) {
        return t(workspaceSpecialRoleIds[role._id as WorkspaceDefaultRoleId].name);
      }

      return role.name;
    };

    if (!member.memberId) return t`Guest`;

    if (member.roles.length === 0) {
      return t(workspaceSpecialRoleIds[WorkspaceDefaultRoleId.MEMBER].name);
    }

    if (member.roles.some((v) => v._id === WorkspaceDefaultRoleId.OWNER)) {
      return t(workspaceSpecialRoleIds[WorkspaceDefaultRoleId.OWNER].name);
    }

    if (member.roles.some((v) => v._id === WorkspaceDefaultRoleId.ADMIN)) {
      return t(workspaceSpecialRoleIds[WorkspaceDefaultRoleId.ADMIN].name);
    }

    return member.roles.map((v) => getWorkspaceRoleName(v)).join(", ");
  }, [member.roles, t]);

  return roles;
};
