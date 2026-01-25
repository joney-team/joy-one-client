import { WorkspaceMemberWorkingTimeType } from "@/graphql/types.graphql";
import { UserEntity } from "@/modules/users/users-types";
import { WorkspaceEntity } from "@/modules/workspaces/workspaces-types";

export interface UpdateWorkspaceMemberDto {
  displayName?: string;
  color?: string;
  workingTimeType?: WorkspaceMemberWorkingTimeType;
  roleIds?: string[];
  workspaceBranchIds?: string[];
}

export interface ChangeWorkspaceMemberRoleDto {
  roleId?: string;
}

export interface WorkspaceMemberBranchesDto {
  branchIds?: string[];
}

export interface VerifyInvitaionTokenResponse {
  workspace: WorkspaceEntity;
  invitorUser: UserEntity;
  workspaceId: string;
  invitorUserId: string;
}

export interface WorkspaceMemberOnlineStatus {
  [userId: string]: boolean;
}
