import { BaseMongoEntity, EntitySource, Gender, Query } from "@/types";
import { LocationEntity } from "@/modules/locations/locations-types";

export interface CustomerDto {
  name: string;
  phone: string;
  plainCode?: string;
  birthday?: number;
  avatar?: string;
  email?: string;

  location?: LocationEntity;
  secondaryLocation?: LocationEntity;

  vnLocation?: LocationEntity;
  vnSecondaryLocation?: LocationEntity;

  presenterCustomerId?: string;
  gender?: Gender;
  medicalHistory?: string[];
  assigneeUserIds?: string[];
  tagIds?: string[];
  salaryAmount?: number;
  relatedCustomerIds?: string[];
  relationshipContacts?: CustomerRelationshipContact[];
  socialFacebookUrl?: string;
  createdAt?: number;
  source?: EntitySource;
}

export interface CustomerRelationshipContact {
  name: string;
  phone: string;
  type: string;
}

export interface CustomerEntity extends BaseMongoEntity {
  code: string;
  plainCode?: string;
  name: string;
  birthday?: number;
  phone: string;
  avatar?: string;
  email?: string;

  location?: LocationEntity;
  secondaryLocation?: LocationEntity;
  vnLocation?: LocationEntity;

  vnSecondaryLocation?: LocationEntity;
  vnSecondaryLocationFullAddress?: string;

  vnPrevLocationFullAddress?: string;
  vnPrevSecondaryLocationFullAddress?: string;
  vnLocationFullAddress?: string;

  presenterCustomerId?: string;
  presenterCustomer?: CustomerEntity;
  gender: Gender;
  medicalHistory: string[];
  createdByUserId: string;
  workspaceId: string;
  tagIds: string[];
  lastCheckin: number;
  salaryAmount?: number;
  relatedCustomerIds?: string[];
  relationshipContacts?: CustomerRelationshipContact[];
  socialFacebookUrl?: string;
}

export interface QueryCustomers extends Query {
  q?: string;
  userInChargeId?: string;
  sortBy?:
    | "updatedAtDESC"
    | "updatedAtASC"
    | "createdAtDESC"
    | "createdAtASC"
    | "lastCheckinDESC"
    | "lastCheckinASC";
}

export interface AssignCustomerDto {
  userIds: string[];
}

export interface CustomersReport {
  total: number;
  newIds: string[];
}

export interface CustomerRealtimeReport {
  newCustomersToday: number;
}

export type CustomerShortInfo = Pick<
  CustomerEntity,
  | "code"
  | "plainCode"
  | "name"
  | "phone"
  | "email"
  | "gender"
  | "avatar"
  | "tagIds"
  | "lastCheckin"
  | "workspaceId"
  | "workspaceBranchId"
> & {
  _id: string;
};
