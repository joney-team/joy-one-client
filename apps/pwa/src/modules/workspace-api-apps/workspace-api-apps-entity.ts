import type { BaseMongoEntity } from "@/types";
import { WorkspaceMemberFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";

export interface WorkspaceApiAppEntity extends BaseMongoEntity {
  workspaceId: string;
  memberId: string;
  userId: string;
  secretKey: string;
  enabled: boolean;
  authVersion: number;
}

export interface IWorkspaceApiApp extends WorkspaceApiAppEntity {
  member: WorkspaceMemberFragment;
}
