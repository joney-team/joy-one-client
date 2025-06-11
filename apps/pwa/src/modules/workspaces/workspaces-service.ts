import { getLocalStorage } from "@/hooks/use-local-storage";
import { AppPageMetadata, StorageKey } from "@/types";
import { isServer } from "@/utils/common.utils";
import { Icon, IconBuilding, IconBuildingHospital, IconCode, IconCreditCardPay, IconDental, IconPlant2, IconSparkles, IconStethoscope } from "@tabler/icons-react";
import { api } from "../apis";
import { WorkspaceEntity, WorkspaceInviteInformation, WorkspaceType } from "./workspaces-types";

export const getWorkspaceId = () => {
  if (isServer()) return;
  return getLocalStorage(StorageKey.WORKSPACE_ID);
}

export function getWorkspaceTypeIcon(type: WorkspaceType) {
  const workspaceTypeIcons: { [key in WorkspaceType]: Icon } = {
    [WorkspaceType.HOSPITAL]: IconBuildingHospital,
    [WorkspaceType.CLINIC]: IconStethoscope,
    [WorkspaceType.DENTAL]: IconDental,
    [WorkspaceType.SPA]: IconPlant2,
    [WorkspaceType.BEAUTY_SALON]: IconSparkles,
    [WorkspaceType.BUSINESS]: IconBuilding,
    [WorkspaceType.CREDIT]: IconCreditCardPay,
    [WorkspaceType.SOFTWARE]: IconCode,
  }

  return workspaceTypeIcons[type]
}

export async function workspaceInitialize() {
  return api.get('/workspace-initialize');
}

export async function getWorkspaceByInviteCode(inviteCode: string) {
  return api.get<AppPageMetadata>(`/workspaces/invite/${inviteCode}/metadata`);
}

export async function getWorkspaceInviteInformation(inviteCode: string) {
  return api.get<WorkspaceInviteInformation>(`/workspaces/invite/${inviteCode}`);
}

export async function regenerateWorkspaceInviteCode() {
  return api.post<WorkspaceEntity>('/workspaces/regenerate-invite-code');
}

export async function getWorkspaceById(id: string) {
  return api.get<WorkspaceEntity>(`/workspaces/ids/${id}`);
}