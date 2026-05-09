import { IsNumber, IsOptional, IsString } from 'class-validator';
import { SubscriptionEntity } from '../subscriptions/entities/subscription.entity';

export enum WorkspaceSubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
}

export class SelectWorkspaceSubscriptionDto {
  @IsString()
  subscriptionId: string;
}

export class SetFixedWorkspaceSubscriptionDto {
  @IsString()
  @IsOptional()
  subscriptionId?: string;
}

export interface WorkspaceSubscriptionStat {
  subscriptionId: string;
  totalMembers: number;
  storage: number;
  totalMetaPages: number;
  totalZaloOAs: number;
}

export class CalculateWorkspaceSubscriptionBillingsDto {
  @IsString()
  workspaceId: string;

  @IsNumber()
  @IsOptional()
  time?: number;

  @IsNumber()
  @IsOptional()
  totalMembers?: number;

  @IsString()
  @IsOptional()
  selectedSubscriptionId?: string;
}

export interface CalculateWorkspaceSubscriptionBillingResponse {
  workspaceSubscriptionId: string;
  selectedSubscription: SubscriptionEntity;
  billedSubscription: SubscriptionEntity;
  totalPrice: number;
  billedStat: WorkspaceSubscriptionStat;
  billedAt: number;
  nextBillingAt: number;
}
