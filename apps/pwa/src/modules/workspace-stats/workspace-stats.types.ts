import { BaseMongoEntity } from "@/types";
import { WorkspaceEntity } from "../workspaces/workspaces-types";

export interface WorkspaceStatsEntity extends BaseMongoEntity {
  workspace: Pick<WorkspaceEntity, '_id' | 'name' | 'logo' | 'type'>
  storageUsage?: number;
  memberCount?: number;
  bookingCount?: number;
  customerCount?: number;
  orderCount?: number;
}
