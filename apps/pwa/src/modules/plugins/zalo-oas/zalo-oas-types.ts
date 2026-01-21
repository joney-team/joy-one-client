import { WorkspaceType } from "@/graphql/types.graphql";
import { BaseMongoEntity } from "@/types";

export enum PluginZaloOaStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum PluginZaloOaZNSTemplateId {
  BOOKING = "BOOKING",
  CUSTOMER_BIRTHDAY = "CUSTOMER_BIRTHDAY",
  OTP = "OTP",

  LOAN_FULFILLED = "LOAN_FULFILLED",
  LOAN_RECEIPT_PAID = "LOAN_RECEIPT_PAID",
  LOAN_RECEIPT_PARTIAL_PAY = "LOAN_RECEIPT_PARTIAL_PAY",
  LOAN_RECEIPT_REMIND = "LOAN_RECEIPT_REMIND",
}

export type PluginZaloZNSTemplateIds = {
  [key in PluginZaloOaZNSTemplateId]?: string;
};

export type PluginZaloZNSTemplateStatues = {
  [key in PluginZaloOaZNSTemplateId]?: boolean;
};

export interface UpdatePluginZaloOaDto {
  znsTemplateIds?: PluginZaloZNSTemplateIds;
  znsTemplateStatues?: PluginZaloZNSTemplateStatues;
}

export interface ZaloOaInfo {
  name: string;
  description?: string;
  avatar: string;
  oa_id: string;
  is_verified: boolean;
  package_name: string;
  package_valid_through_date: string;
  cate_name: string;
}

export interface PluginZaloOaEntity extends BaseMongoEntity {
  workspaceId: string;
  id: string;
  znsTemplateIds?: PluginZaloZNSTemplateIds;
  znsTemplateStatues?: PluginZaloZNSTemplateStatues;
  status: PluginZaloOaStatus;
  isDisabled?: boolean;
  isDefault: boolean;
  info: ZaloOaInfo;
}

export interface PluginZaloConnectCallbackDto {
  code: string;
}

export interface ZnsTemplateConfig {
  workspaceTypes?: WorkspaceType[];
  fields: { fieldName: string; description: string; default?: string }[];
}

export type ZnsTemplateConfigs = {
  [key in PluginZaloOaZNSTemplateId]: ZnsTemplateConfig;
};

export interface ZaloOaGmfGroupSetting {
  isAdminNotificationEnabled?: boolean;
}

export interface ZaloOaGmfGroupSettings {
  [groupId: string]: ZaloOaGmfGroupSetting;
}

export interface ZaloOaGmfGroup extends ZaloOaGmfGroupSetting {
  id: string;
  name: string;
  avatar: string;
  group_id: string;
  group_link: string;
  group_description: string;
  total_member: number;
  status: "enabled" | "disabled";
}
