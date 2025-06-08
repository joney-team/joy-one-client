import { BaseMongoEntity } from "@/types";
import { RangeReport, RealtimeReport, ReportType } from "./reports-types";

export interface ReportEntity<T extends RangeReport | RealtimeReport> extends BaseMongoEntity {
  type: ReportType;
  ref: string;
  workspaceId: string;
  workspaceBranchIds?: string[];
  userId?: string;
  data: T;
}
