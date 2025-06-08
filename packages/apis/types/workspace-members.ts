import { WorkSlot } from "./general"
import { WorkspaceEntity } from "./workspace"
import { WorkspacePermission } from "./workspace-roles"
import { WorkspaceRoleEntity } from "./workspace-roles"
import { WorkspaceBranchEntity } from "./workspace-branches"

export interface UpdateWorkspaceMemberDto {
  displayName?: string
  color?: string
  workSlots?: WorkSlot[]
  workingTimeType?: WorkspaceMemberWorkingTimeType
  roleIds?: string[]
  workspaceBranchIds?: string[]
}

export interface ChangeWorkspaceMemberRoleDto {
  roleId?: string;
}

export interface WorkspaceMemberBranchesDto {
  branchIds?: string[];
}

export interface VerifyInvitaionTokenResponse {
  workspace: WorkspaceEntity;
  invitorUser: any;
  workspaceId: string;
  invitorUserId: string;
}

export enum WorkspaceMemberWorkingTimeType {
  FULLTIME = 'FULLTIME',
  FREELANCER = 'FREELANCER',
}

export interface WorkspaceMember {
  _id: string; // userId
  userId: string;
  memberId?: string;
  name: string;
  memberDisplayName?: string;
  avatar?: string;
  phone?: string;
  color?: string;
  email?: string;
  roles: Pick<WorkspaceRoleEntity, '_id' | 'name' | 'color'>[];
  workingTimeType?: WorkspaceMemberWorkingTimeType;
  workspaceBranchIds: string[];
  workspaceBranches: Pick<WorkspaceBranchEntity, '_id' | 'name'>[];
  deviceIds?: string[];
  lastSignInAt?: number;
  joinedAt?: number;
  workspaceId: string;
  workspace: WorkspaceEntity;
  permissions: WorkspacePermission[];
  createdAt?: number;
}

export interface WorkspaceMemberOnlineStatus {
  [userId: string]: boolean;
}

export type WorkspaceMemberInfo = Pick<WorkspaceMember,
  '_id' |
  'userId' |
  'name' |
  'memberId' |
  'memberDisplayName' |
  'avatar' |
  'phone' |
  'color' |
  'email' |
  'roles'
>