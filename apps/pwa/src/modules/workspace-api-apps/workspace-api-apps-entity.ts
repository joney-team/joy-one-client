import type { BaseMongoEntity } from "@/types";
import { WorkspaceMemberDataFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";

export interface WorkspaceApiAppEntity extends BaseMongoEntity {
  workspaceId: string;
  memberId: string;
  userId: string;
  secretKey: string;
  enabled: boolean;
  authVersion: number;
}

export interface IWorkspaceApiApp extends WorkspaceApiAppEntity {
  member: WorkspaceMemberDataFragment;
}
