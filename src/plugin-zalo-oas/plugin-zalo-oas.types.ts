import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { GraphQLJSONObject } from 'src/graphql/graphql-type';

export enum PluginZaloOaStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(PluginZaloOaStatus, {
  name: 'PluginZaloOaStatus',
  description: 'Status of Zalo OA connection',
});

export class UpdatePluginZaloOaTemplatesDto {
  @IsString()
  @IsOptional()
  templateBookingId?: string;
}

export class ActivePluginZaloOaTokenDto {
  @IsString()
  refreshToken: string;
}

export enum PluginZaloOaZNSTemplateId {
  BOOKING = 'BOOKING',
  CUSTOMER_BIRTHDAY = 'CUSTOMER_BIRTHDAY',
  OTP = 'OTP',

  LOAN_FULFILLED = 'LOAN_FULFILLED',
  LOAN_RECEIPT_PAID = 'LOAN_RECEIPT_PAID',
  LOAN_RECEIPT_PARTIAL_PAY = 'LOAN_RECEIPT_PARTIAL_PAY',
  LOAN_RECEIPT_REMIND = 'LOAN_RECEIPT_REMIND',
}

registerEnumType(PluginZaloOaZNSTemplateId, {
  name: 'PluginZaloOaZNSTemplateId',
  description: 'Template IDs for Zalo OA ZNS messages',
});

export type PluginZaloZNSTemplateIds = {
  [key in PluginZaloOaZNSTemplateId]?: string;
};

export type PluginZaloZNSTemplateStatues = {
  [key in PluginZaloOaZNSTemplateId]?: boolean;
};

@InputType()
export class UpdatePluginZaloOaInput {
  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  znsTemplateIds?: PluginZaloZNSTemplateIds;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  znsTemplateStatues?: PluginZaloZNSTemplateStatues;
}

@InputType()
export class PluginZaloOaSendZnsInput {
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isTesting?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  code?: string;

  @Field()
  @IsString()
  phoneNumber: string;

  @Field(() => PluginZaloOaZNSTemplateId)
  @IsEnum(PluginZaloOaZNSTemplateId)
  templateId: PluginZaloOaZNSTemplateId;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  data: any;
}

@ObjectType()
export class ZaloOaInfo {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  avatar: string;

  @Field()
  oa_id: string;

  @Field()
  is_verified: boolean;

  @Field()
  package_name: string;

  @Field()
  package_valid_through_date: string;

  @Field()
  cate_name: string;
}

@ObjectType()
export class ZaloOaGmfGroupSetting {
  @Field({ nullable: true })
  isAdminNotificationEnabled?: boolean;
}

export interface ZaloOaGmfGroupSettings {
  [groupId: string]: ZaloOaGmfGroupSetting;
}

export enum ZaloOaGmfGroupStatus {
  enabled = 'enabled',
  disabled = 'disabled',
}

registerEnumType(ZaloOaGmfGroupStatus, {
  name: 'ZaloOaGmfGroupStatus',
  description: 'Status of Zalo OA GMF Group',
});

@ObjectType()
export class ZaloOaGmfGroup extends ZaloOaGmfGroupSetting {
  @Field()
  name: string;

  @Field()
  avatar: string;

  @Field()
  group_id: string;

  @Field()
  group_link: string;

  @Field()
  group_description: string;

  @Field()
  total_member: number;

  @Field(() => ZaloOaGmfGroupStatus)
  status: ZaloOaGmfGroupStatus;
}

@ObjectType()
export class ConnectZaloOaResponse {
  @Field()
  url: string;
}
