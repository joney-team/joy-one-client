import { BaseMongoEntity } from "@/types";

export interface CreateWorkspaceSdkDto {
  name: string;
}

export interface WorkspaceSdkEntity extends BaseMongoEntity {
  workspaceId: string;
  name: string;
  key: string;
}