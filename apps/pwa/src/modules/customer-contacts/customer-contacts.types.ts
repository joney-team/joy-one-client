import { BaseMongoEntity } from "@/types";

export interface CustomerContact {
  name: string
  phones: string[]
}

export interface CustomerContactDto {
  contacts: CustomerContact[]
}

export interface CustomerContactEntity extends BaseMongoEntity {
  customerId: string;
  workspaceId: string;
  contacts: CustomerContact[]
}