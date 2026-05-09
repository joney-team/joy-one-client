import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class SubscriptionDto {
  @IsString()
  name: string;

  @IsString()
  color: string;

  @IsNumber()
  pricePerMember: number;

  @IsNumber()
  @IsOptional()
  pricePerMemberNotSale?: number;

  @IsNumber()
  limitMembers: number;

  @IsNumber()
  limitStorage: number;

  @IsNumber()
  limitSocialConnections: number;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export enum SubscriptionLimited {
  MEMBERS = 'MEMBERS',
  STORAGE = 'STORAGE',
  SOCIAL_CONNECTIONS = 'SOCIAL_CONNECTIONS',
}
