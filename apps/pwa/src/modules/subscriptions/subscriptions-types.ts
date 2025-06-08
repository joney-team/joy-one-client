import { BaseMongoEntity } from "@/types";

export interface SubscriptionDto {
  name: string;
  pricePerMember: number;
  pricePerMemberNotSale?: number;
  limitMembers: number;
  limitStorage: number;
  limitSocialConnections: number;
  isPrivate: boolean;
}

export interface SubscriptionEntity extends BaseMongoEntity {
  name: string;
  color: string;
  pricePerMember: number;
  pricePerMemberNotSale?: number;
  limitMembers: number;
  limitStorage: number;
  limitSocialConnections: number;
  isPrivate: boolean;
  isDefault: boolean;
}