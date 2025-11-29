import { WorkSlot } from "@/types";
import { UserEntity } from "@/modules/users/users-types";
import { WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import {
  WorkspacePermission,
  WorkspaceRoleEntity,
} from "@/modules/workspace-roles/workspace-roles-types";
import { WorkspaceEntity } from "@/modules/workspaces/workspaces-types";

export interface UpdateWorkspaceMemberDto {
  displayName?: string;
  color?: string;
  workSlots?: WorkSlot[];
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

export enum WorkspaceMemberWorkingTimeType {
  FULLTIME = "FULLTIME",
  FREELANCER = "FREELANCER",
}

export interface WorkspaceMember {
  _id: string;
  userId: string;
  memberId?: string | null;
  name: string;
  memberDisplayName?: string | null;
  avatar?: string | null;
  phone?: string | null;
  color?: string | null;
  email?: string | null;
  roles: Pick<WorkspaceRoleEntity, "_id" | "name" | "color">[];
  workingTimeType?: WorkspaceMemberWorkingTimeType | null;
  workspaceBranchIds: string[];
  workspaceBranches: Pick<WorkspaceBranchEntity, "_id" | "name">[];
  deviceIds?: string[] | null;
  lastSignInAt?: number | null;
  joinedAt?: number | null;
  workspaceId: string;
  workspace: WorkspaceEntity;
  permissions: WorkspacePermission[];
  createdAt?: number | null;
}

export interface WorkspaceMemberOnlineStatus {
  [userId: string]: boolean;
}

export type WorkspaceMemberInfo = Pick<
  WorkspaceMember,
  | "_id"
  | "userId"
  | "name"
  | "memberId"
  | "memberDisplayName"
  | "avatar"
  | "phone"
  | "color"
  | "email"
  | "roles"
>;
