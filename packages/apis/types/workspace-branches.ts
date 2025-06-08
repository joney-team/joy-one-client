import { BaseMongoEntity } from "./database";
import { LocationEntity } from "./locations";

export interface WorkspaceBranchEntity extends BaseMongoEntity {
  workspaceId: string;
  name: string;
  hotline?: string;
  location?: LocationEntity;
}

export interface WorkspaceBranchDto {
  name: string;
  hotline?: string;
  location?: LocationEntity;
}