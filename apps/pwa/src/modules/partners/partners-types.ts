import { BaseMongoEntity } from "@/types";

export interface PartnerDto {
  name: string;
  phone: string;
  logo?: string;
  email?: string;
}

export interface PartnerEntity extends BaseMongoEntity {
  name: string;
  phone: string;
  logo?: string;
  email?: string;
  workspaceId: string;
  isArchived?: boolean;
}