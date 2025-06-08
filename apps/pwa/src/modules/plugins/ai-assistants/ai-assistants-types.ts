import { BaseMongoEntity } from "@/types";

export enum PluginAiAssistantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum PluginAiAssistantProvider {
  VONIC_DIFY = 'VONIC_DIFY',
  DIFY = 'DIFY',
}

export interface CreatePluginAiAssistantDto {
  provider: PluginAiAssistantProvider;
  apiKey: string;
}

export interface UpdatePluginAiAssistantDto {
  enabled: boolean;
  provider?: PluginAiAssistantProvider;
  apiKey?: string;
}

export interface PluginAiAssistantEntity extends BaseMongoEntity {
  provider: PluginAiAssistantProvider;
  providerName: string;
  workspaceId: string;
  enabled: boolean;
  status: PluginAiAssistantStatus;
}
