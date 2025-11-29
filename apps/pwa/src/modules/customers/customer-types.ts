import { BaseMongoEntity, EntitySource, Gender, Query } from "@/types";
import { LocationEntity } from "@/modules/locations/locations-types";

export interface CustomerDto {
  name: string;
  phone?: string | null;
  plainCode?: string | null;
  birthday?: number | null;
  avatar?: string | null;
  email?: string | null;

  location?: LocationEntity | null;
  secondaryLocation?: LocationEntity | null;

  vnLocation?: LocationEntity | null;
  vnSecondaryLocation?: LocationEntity | null;

  presenterCustomerId?: string | null;
  gender?: Gender | null;
  medicalHistory?: string[] | null;
  assigneeUserIds?: string[] | null;
  tagIds?: string[] | null;
  salaryAmount?: number | null;
  relatedCustomerIds?: string[] | null;
  relationshipContacts?: CustomerRelationshipContact[] | null;
  socialFacebookUrl?: string | null;
  createdAt?: number | null;
  source?: EntitySource | null;
}

export interface CustomerRelationshipContact {
  name: string;
  phone: string;
  type: string;
}

export interface CustomerEntity extends BaseMongoEntity {
  code: string;
  plainCode?: string | null;
  name: string;
  birthday?: number | null;
  phone?: string | null;
  avatar?: string | null;
  email?: string | null;

  location?: LocationEntity | null;
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
