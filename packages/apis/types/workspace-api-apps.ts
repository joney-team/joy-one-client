import type { BaseMongoEntity } from "./database";
import type { WorkspaceMember } from "./workspace-members";

export interface WorkspaceApiAppEntity extends BaseMongoEntity {
  workspaceId: string;
  memberId: string;
  userId: string;
  secretKey: string;
  enabled: boolean;
  authVersion: number;
}

export interface IWorkspaceApiApp extends WorkspaceApiAppEntity {
  member: WorkspaceMember;
}

export interface WorkspaceApiAppDto {
  name: string;
  enabled: boolean;
  roleIds?: string[];
  workspaceBranchIds?: string[];
}