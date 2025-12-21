import { AppCurrency, BaseMongoEntity } from "@/types";
import { Icon } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";
import { AppLocale } from "../lang/lang-types";
import { LocationEntity } from "../locations/locations-types";
import { WorkspaceBranchEntity } from "../workspace-branches/workspace-branches-types";
import {
  VerifyInvitaionTokenResponse,
  WorkspaceMemberLegacy,
  WorkspaceMemberOnlineStatus,
} from "../workspace-members/workspace-members-types";
import { WorkspacePermission, WorkspaceRoleEntity } from "../workspace-roles/workspace-roles-types";
import {
  SetWorkspaceSettingsDto,
  WorkspaceSettingEntity,
  WorkspaceView,
} from "../workspace-settings/workspace-settings-types";
import { WorkspaceModule, WorkspaceModuleId, workspaceModuleConfigs } from "./workspace-modules";
import { WorkspaceMemberDataFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";

export interface PluginMailerAccount {
  user: string;
  pass: string;
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

export enum WorkspaceType {
  SOFTWARE = "SOFTWARE",
  BUSINESS = "BUSINESS",
  HOSPITAL = "HOSPITAL",
  CLINIC = "CLINIC",
  DENTAL = "DENTAL",
  SPA = "SPA",
  BEAUTY_SALON = "BEAUTY_SALON",
  CREDIT = "CREDIT",
}

export interface WorkspaceDto {
  name: string;
  logo?: string;
  location?: LocationEntity;
  type?: WorkspaceType;
  hotline?: string;
  phone?: string;
  appIcon?: string;
  appDomain?: string;
  appName?: string;
  appColor?: string;
  appColorShape?: number;
  locale?: AppLocale;
}

export interface WorkspaceContext {
  isInitialized: boolean;
  isAvailable: boolean;
  isHasAccessAllBranches: boolean;
  member: WorkspaceMemberDataFragment;
  userMember: WorkspaceMemberLegacy;
  userMembers: WorkspaceMemberLegacy[];
  select: (workspaceId: string) => void;
  create: (dto: WorkspaceDto) => Promise<void>;
  update: (dto: WorkspaceDto) => Promise<WorkspaceEntity>;
  isUserOnline: (userId: string) => boolean;
  leave: () => void;
  invitationState: WorkspaceMemberInvitationState | undefined;
  leaveInvitation: () => void;
  settings: WorkspaceSettingEntity;
  isHrmTimekeepingAvailable: boolean;
  roles: WorkspaceRoleEntity[];
  permissions: WorkspacePermission[];
  hasPermission: (permission: WorkspacePermission) => boolean;
  updateSettings: (settings: WorkspaceSettingEntity) => Promise<void>;
  setSettings: (dto: Partial<SetWorkspaceSettingsDto>, exec?: boolean) => void | Promise<void>;
  type: WorkspaceType;
  view: WorkspaceView;
  setView: (view: WorkspaceView) => Promise<WorkspaceView>;
  resetView: () => Promise<WorkspaceView>;
  isCreateNew: boolean;
  setIsCreateNew: Dispatch<SetStateAction<boolean>>;
  archive: () => Promise<void>;
  join: (code: string) => Promise<void>;
  ref: string;
  onlineStatus: WorkspaceMemberOnlineStatus;
  defaultBranch?: Pick<WorkspaceBranchEntity, "_id" | "name" | "hotline" | "settings"> | null;
  isShouldEnableBranches: boolean;
  isShowBranches: boolean;
  currency: AppCurrency;
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

export interface WorkspaceMemberInvitationState {
  invitation?: VerifyInvitaionTokenResponse;
  error?: string;
}

export interface CreateWorkspaceInviteMemberDto {
  email?: string;
}

export enum DashboardWidgetDisplayType {
  REPORT = "REPORT",
  CHART = "CHART",
}

export interface DashboardWidget {
  id: string;
  displayType: DashboardWidgetDisplayType;
  icon?: Icon;
  name?: string;
  data?: any;
  sparkline?: number[];
}

export interface WorkspaceSchedule {
  dayOfWeekIndex: number;
  startAt: {
    hours: number;
    minutes: number;
  };
  endAt: {
    hours: number;
    minutes: number;
  };
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
