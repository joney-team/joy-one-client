import { BaseMongoEntity, Gender } from "@/types";
import { CustomerEntity } from "../customers/customer-types";
import { LocationEntity } from "../locations/locations-types";

export enum CustomerKycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface CustomerKycDto {
  cidNumber: string;
  cidFullName: string;
  cidLocation: LocationEntity;
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
  cidLocation: LocationEntity;
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
  customer: CustomerEntity;
  workspaceId: string;
  versions: CustomerKycVersion[]
  status: CustomerKycStatus;
}