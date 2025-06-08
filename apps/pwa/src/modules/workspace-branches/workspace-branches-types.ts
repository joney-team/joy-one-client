import { BaseMongoEntity } from "@/types";
import { LocationEntity } from "@/modules/locations/locations-types";

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