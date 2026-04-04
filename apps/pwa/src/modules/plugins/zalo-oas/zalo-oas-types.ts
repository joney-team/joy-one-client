import { PluginZaloOaZnsTemplateId, WorkspaceType } from "@/graphql/types.graphql";

export interface ZnsTemplateConfig {
  workspaceTypes?: WorkspaceType[];
  fields: { fieldName: string; description: string; default?: string }[];
}

export type ZnsTemplateConfigs = {
  [key in PluginZaloOaZnsTemplateId]: ZnsTemplateConfig;
};

export interface ZaloOaGmfGroupSetting {
  isAdminNotificationEnabled?: boolean;
}

export interface ZaloOaGmfGroupSettings {
  [groupId: string]: ZaloOaGmfGroupSetting;
}
