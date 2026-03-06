import { BaseMongoEntity, Gender } from "@/types";
import { LocationEntity } from "../locations/locations-types";
import { Location } from "@/graphql/types.graphql";

export enum CustomerKycStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface CustomerKycDto {
  cidNumber: string;
  cidFullName: string;
  cidLocation?: LocationEntity;
  cidVnLocation?: LocationEntity;
  cidCreatedAt?: number;
  cidGender: Gender;
  cidBirthday: number;
  cidRaw: string;
  frontOfCidImage: string;
  backOfCidImage: string;
  portraitImage: string;
}

export interface CustomerKycVersion {
  id: string;

  frontOfCidImage: string;
  backOfCidImage: string;
  portraitImage: string;

  cidNumber: string;
  cidFullName: string;
  cidLocation?: Location;
  cidVnLocation?: Location;
  cidRaw: string;
  cidGender: Gender;
  cidBirthday: number;
  cidCreatedAt?: number;

  createdAt: number;
  rejectReason?: string;
  status?: CustomerKycStatus;
}

export interface RejectCustomerKycDto {
  reason: string;
}

export interface CustomerKycEntity extends BaseMongoEntity {
  customerId: string;
  customer: any;
  workspaceId: string;
  versions: CustomerKycVersion[];
  status: CustomerKycStatus;
}
