import type { BaseMongoEntity } from "@/types";
import type { WorkspaceMemberLegacy } from "../workspace-members/workspace-members-types";

export interface WorkspaceApiAppEntity extends BaseMongoEntity {
  workspaceId: string;
  memberId: string;
  userId: string;
  secretKey: string;
  enabled: boolean;
  authVersion: number;
}

export interface IWorkspaceApiApp extends WorkspaceApiAppEntity {
  member: WorkspaceMemberLegacy;
}
