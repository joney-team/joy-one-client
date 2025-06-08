import { BaseMongoEntity } from "./database";

export interface PluginMetaConnectDto {
  accessToken: string;
  userId: string;
}

export enum PluginMetaPageStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface PluginMetaPage {
  id: string;
  name: string;
  accessToken: string;
  tasks: string[];
  category: string;
  categories: { id: string, name: string }[];
}

export interface PluginMetaPageEntity extends BaseMongoEntity {
  workspaceId: string;
  id: string;
  name: string;
  logo?: string;
  accessToken: string;
  tasks: string[];
  category: string;
  categories: { id: string, name: string }[];
  status: PluginMetaPageStatus;
  isDisabled?: boolean;
}

export interface PluginMetaPageInfoCategory {
  id: string;
  name: string;
}

export interface PluginMetaPageInfo {
  pageId: string;
  name: string;
  categories: PluginMetaPageInfoCategory[];
  accessToken: string;
  status: 'CONNECTED' | 'NOT_CONNECTED' | 'CONNECTED_WITH_OTHER_WORKSPACE';
  avatar?: string;
}