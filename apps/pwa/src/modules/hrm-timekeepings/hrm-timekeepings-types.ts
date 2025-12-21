import type { BaseMongoEntity, Coordinates, WorkSlot } from "@/types";
import type { WorkspaceMemberLegacy } from "@/modules/workspace-members/workspace-members-types";

export enum HrmTimekeepingType {
  CHECK_IN = "CHECK_IN",
  CHECK_OUT = "CHECK_OUT",
}

export enum HrmTimekeepingMethod {
  LOCATION = "LOCATION",
  REQUEST = "REQUEST",
}

export enum HrmTimekeepingStatus {
  PENDING = "PENDING",
  MANUAL_APPROVAL = "MANUAL_APPROVAL",
  AUTO_APPROVAL = "AUTO_APPROVAL",
  REJECTED = "REJECTED",
}

export interface LocationTimekeepingDto {
  coordinates: Coordinates;
}

export interface RequestTimekeepingDto {
  type: HrmTimekeepingType;
  time: number;
  note: string;
}

export interface RejectTimekeepingDto {
  reason?: string;
}

export interface HrmTimekeepingEntity extends BaseMongoEntity {
  userId: string;
  user: WorkspaceMemberLegacy;
  workspaceId: string;
  time: number;
  coordinates?: Coordinates;
  type: HrmTimekeepingType;
  method: HrmTimekeepingMethod;
  status: HrmTimekeepingStatus;
  rejectReason?: string;
  note?: string;
  locationName?: string;
  locationCoordinates?: Coordinates;
}

// ======================= Calculate Timekeepings =======================
export interface HrmCalculateTimekeepingsArgs {
  timekeepings: HrmTimekeepingEntity[];
  workSlots?: WorkSlot[] | undefined;
  rules?: HrmTimekeepingsRules;
}

export interface CheckInLocation {
  coordinates: Coordinates;
  radius: number;
  name: string;
  disabled?: boolean;
}

export interface HrmTimekeepingsRules {
  acceptLatenessUpToMins?: number;
  acceptOverTimeAtLeastMins?: number;
  acceptLocations?: CheckInLocation[];
  requirePhoto?: boolean;
}
