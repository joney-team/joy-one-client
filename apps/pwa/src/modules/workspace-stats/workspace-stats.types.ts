import { BaseMongoEntity } from "@/types";
import { WorkspaceFragment } from "../workspaces/graphql/fragmentWorkspace.graphql";

export interface WorkspaceStatsEntity extends BaseMongoEntity {
  workspace: Pick<
    WorkspaceFragment,
    "_id" | "name" | "logo" | "type" | "appColor" | "logo" | "name" | "appIcon"
  >;
  storageUsage?: number;
  memberCount?: number;
  bookingCount?: number;
  customerCount?: number;
  orderCount?: number;
}
