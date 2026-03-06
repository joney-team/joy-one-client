import { WorkspaceType } from "@/graphql/types.graphql";
import { BaseMongoEntity } from "@/types";
import { Icon } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";
import { AppLocale } from "../lang/lang-types";
import { LocationEntity } from "../locations/locations-types";
import { WorkspaceBranchDataFragment } from "../workspace-branches/graphql/fragmentWorkspaceBranch.graphql";
import { WorkspaceMemberDataFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";
import { VerifyInvitaionTokenResponse } from "../workspace-members/workspace-members-types";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";

export interface PluginMailerAccount {
  user: string;
  pass: string;
}

export interface WorkspaceEntity extends BaseMongoEntity {
  code: string;
  name: string;
  type: WorkspaceType;
  logo?: string | null;
  location?: LocationEntity | null;
  hotline?: string | null;
  phone?: string | null;
  appIcon?: string | null;
  appDomain?: string | null;
  appName?: string | null;
  appColor?: string | null;
  appColorShape?: number;
  locale?: AppLocale;
  inviteCode: string;
  cover?: string;
  branches: number;
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
  locale?: string;
}

export interface WorkspaceContext {
  isInitialized: boolean;
  isAvailable: boolean;
  isHasAccessAllBranches: boolean;
  member: WorkspaceMemberDataFragment;
  userMembers: WorkspaceMemberDataFragment[];
  select: (workspaceId: string) => void;
  create: (dto: WorkspaceDto) => Promise<void>;
  leave: () => void;
  invitationState: WorkspaceMemberInvitationState | undefined;
  leaveInvitation: () => void;
  hasPermission: (permission: WorkspacePermission) => boolean;
  type: WorkspaceType;
  isCreateNew: boolean;
  setIsCreateNew: Dispatch<SetStateAction<boolean>>;
  archive: () => Promise<void>;
  join: (code: string) => Promise<void>;
  ref: string;
  defaultBranch?: Pick<WorkspaceBranchDataFragment, "_id" | "name" | "hotline"> | null;
  isShouldEnableBranches: boolean;
  isShowBranches: boolean;
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
