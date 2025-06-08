import { BaseMongoEntity } from "@/types";
import { WorkspaceSettingEntity } from "../workspace-settings/workspace-settings-types";

export enum LinkType {
  TASK = 'TASK',
  CUSTOMER = 'CUSTOMER',
}

export interface LinkDto {
  url: string;
  slug?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  expireAt?: number;
  isReplace?: boolean;
  type?: LinkType;
}

export interface LinkEntity extends BaseMongoEntity {
  link: string;
  slug: string;
  url: string;
  workspaceId: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  expireAt?: number;
  ownerUserId?: string;
  settings: {
    appIcon?: string;
    appDomain?: string;
    appName?: string;
    appColor?: string;
  };
  type?: LinkType;
}