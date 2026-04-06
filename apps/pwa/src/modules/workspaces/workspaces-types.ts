import type { CreateWorkspaceInput, WorkspaceType } from "@/graphql/types.graphql";
import type { Icon } from "@tabler/icons-react";
import type { Dispatch, SetStateAction } from "react";
import type { WorkspaceBranchFragment } from "../workspace-branches/graphql/fragmentWorkspaceBranch.graphql";
import type { WorkspaceMemberFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";
import type { WorkspacePermission } from "../workspace-roles/workspace-roles-types";

export interface WorkspaceContext {
  isInitialized: boolean;
  isAvailable: boolean;
  member: WorkspaceMemberFragment;
  userMembers: WorkspaceMemberFragment[];
  select: (workspaceId: string) => void;
  create: (input: CreateWorkspaceInput) => Promise<void>;
  leave: () => void;
  leaveInvitation: () => void;
  hasPermission: (permission: WorkspacePermission) => boolean;
  type: WorkspaceType;
  isCreateNew: boolean;
  setIsCreateNew: Dispatch<SetStateAction<boolean>>;
  archive: () => Promise<void>;
  join: (code: string) => Promise<void>;
  ref: string;
  defaultBranch?: Pick<WorkspaceBranchFragment, "_id" | "name" | "hotline"> | null;
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
}
