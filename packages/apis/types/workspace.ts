import { LocationEntity } from "./locations";
import { PluginBankAccount } from "./plugin-banks";
import { PluginMailerAccount } from "./plugin-mailer";
import { AppLocale } from "./lang";
import { BaseMongoEntity } from "./database";
import { WorkspaceRoleEntity } from "./workspace-roles";
import { WorkspaceSettingEntity } from "./workspace-settings";

export interface UnassignWorkspaceRoleDto {
  userId: string;
}

export enum WorkspaceType {
  SOFTWARE = 'SOFTWARE',
  BUSINESS = 'BUSINESS',
  HOSPITAL = 'HOSPITAL',
  CLINIC = 'CLINIC',
  DENTAL = 'DENTAL',
  SPA = 'SPA',
  BEAUTY_SALON = 'BEAUTY_SALON',
}

export interface WorkspaceDto {
  name: string;
  type: WorkspaceType;
  logo?: string;
  location?: LocationEntity;
  hotline?: string;
  phone?: string;
  bankAccount?: PluginBankAccount;
  mailer?: PluginMailerAccount;

  refCode?: string;
  appIcon?: string;

  appDomain?: string;
  appName?: string;
  appColor?: string;
  appColorShape?: number;
  locale?: AppLocale;
}

export interface CreateWorkspaceDto extends WorkspaceDto {
  code: string;
}

export interface WorkspaceMemberInvitation {
  workspace: {
    _id: string;
    name: string;
    logo: string;
    hotline: string;
    type: WorkspaceType;
  };
  inviter: {
    name: string;
    avatar?: string;
    phone?: string;
  };
  expireAt: number;
}

export interface WorkspaceInviteInformation {
  workspaceId: string;
  type: WorkspaceType;
  name: string;
  logo?: string;
  hotline?: string;
  phone?: string;
  appColor?: string;
  appColorShape?: number;
}

export interface WorkspaceEntity extends BaseMongoEntity {
  code: string;
  name: string;
  type: WorkspaceType;
  logo?: string;
  location?: LocationEntity;
  hotline?: string;
  phone?: string;
  appIcon?: string;
  appDomain?: string;
  appName?: string;
  appColor?: string;
  appColorShape?: number;
  locale?: AppLocale;
  inviteCode: string;
  cover?: string;
  branches: number;
}

export interface WorkspaceSetup {
  roles: WorkspaceRoleEntity[];
  settings: WorkspaceSettingEntity;
}