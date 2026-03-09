import { WorkspaceMemberWorkingTimeType } from "@/graphql/types.graphql";
import { WorkspaceEntity } from "@/modules/workspaces/workspaces-types";
import { AuthUserDataFragment } from "../auth/graphql/fragmentAuthUser.graphql";

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
  invitorUser: AuthUserDataFragment;
  workspaceId: string;
  invitorUserId: string;
}

export interface WorkspaceMemberOnlineStatus {
  [userId: string]: boolean;
}
