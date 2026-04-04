import { WorkspaceMemberFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";
import { WorkspaceRoleFragment } from "./graphql/fragmentWorkspaceRole.graphql";
import { WorkspaceDefaultRoleId, WorkspacePermission } from "./workspace-roles-types";

export function hasPermission(args: {
  role: Pick<WorkspaceRoleFragment, "_id" | "permissions">;
  permission: WorkspacePermission;
}) {
  if (
    args.role._id === WorkspaceDefaultRoleId.ADMIN ||
    args.role._id === WorkspaceDefaultRoleId.OWNER
  ) {
    return true;
  }

  return args.role.permissions.includes(args.permission);
}

export function isMemberHasPermission(args: {
  permission: WorkspacePermission;
  member: Pick<WorkspaceMemberFragment, "roles" | "permissions">;
}) {
  if (
    args.member.roles.some(
      (role) =>
        role._id === WorkspaceDefaultRoleId.ADMIN || role._id === WorkspaceDefaultRoleId.OWNER,
    )
  ) {
    return true;
  }

  return args.member.permissions.includes(args.permission);
}
