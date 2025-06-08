import type { BaseMongoEntity } from "@/types";
import type { WorkspaceMember } from "../workspace-members/workspace-members-types";

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
