import { BaseMongoEntity } from "./database";
import { Coordinates } from "./general";
import { WorkspaceMemberWorkingTimeType } from "./workspace-members";

export enum HrmTimekeepingType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
}

export enum HrmTimekeepingMethod {
  LOCATION = 'LOCATION',
  REQUEST = 'REQUEST',
}

export enum HrmTimekeepingStatus {
  PENDING = 'PENDING',
  MANUAL_APPROVAL = 'MANUAL_APPROVAL',
  AUTO_APPROVAL = 'AUTO_APPROVAL',
  REJECTED = 'REJECTED',
}

export interface LocationTimekeepingDto {
  coordinates: Coordinates;
}

export interface RequestTimekeepingDto {
  type: HrmTimekeepingType;
  time: number;
  note?: string;
}

export interface RejectTimekeepingDto {
  reason?: string;
}

export interface HrmTimekeepingEntity extends BaseMongoEntity {
  userId: string;
  workspaceId: string;
  time: number;
  locationName?: string;
  locationCoordinates?: Coordinates;
  coordinates?: Coordinates;
  type: HrmTimekeepingType;
  method: HrmTimekeepingMethod;
  status: HrmTimekeepingStatus;
  rejectReason?: string;
  note?: string;
}

// ======================= Calculate Timekeepings =======================
export interface HrmCalculateTimekeepingsArgs {
  timekeepingsInOneDay: HrmTimekeepingEntity[];
  rules?: HrmTimekeepingsRules;
  workTimeType?: WorkspaceMemberWorkingTimeType;
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
  requirePhoto?: boolean,
}
