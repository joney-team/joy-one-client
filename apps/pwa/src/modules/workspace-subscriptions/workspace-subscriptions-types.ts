import { BaseMongoEntity } from "@/types";
import { SubscriptionEntity } from "../subscriptions/subscriptions-types";

export enum WorkspaceSubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
}

export interface SelectWorkspaceSubscriptionDto {
  subscriptionId: string;
}

export interface WorkspaceSubscriptionStat {
  totalMembers: number;
  storage: number;
  totalMetaPages: number;
  totalZaloOAs: number;
}

export interface WorkspaceSubscriptionEntity extends BaseMongoEntity {
  workspaceId: string;
  subscriptionId: string;
  subscription: SubscriptionEntity;
  stat: WorkspaceSubscriptionStat;
  billedStat?: WorkspaceSubscriptionStat;
  fixedSubscriptionId?: string;
  billedAt?: number;
}

export interface CalculateWorkspaceSubscriptionBillingsDto {
  workspaceId: string;
  time?: number;
  totalMembers?: number;
  selectedSubscriptionId?: string;
}

export interface CalculateWorkspaceSubscriptionBillingResponse {
  workspaceSubscriptionId: string,
  selectedSubscription: SubscriptionEntity,
  totalPrice: number,
  billedStat: WorkspaceSubscriptionStat,
  billedAt: number,
  nextBillingAt: number,
}