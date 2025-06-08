import { AppPageMetadata, StorageKey } from "@/types";
import { Icon, IconBuilding, IconBuildingHospital, IconCode, IconCreditCardPay, IconDental, IconPlant2, IconSparkles, IconStethoscope } from "@tabler/icons-react";
import { MainRequest } from "../requests/main.request";
import { WorkspaceEntity, WorkspaceInviteInformation, WorkspaceType } from "./workspaces-types";
import { isServer } from "@/utils/common.utils";

export const getWorkspaceId = () => {
  if (isServer()) return;
  return localStorage.getItem(StorageKey.WORKSPACE_ID);
}

export const removeWorkspaceId = () => {
  if (isServer()) return;
  localStorage.removeItem(StorageKey.WORKSPACE_ID);
}

export const setWorkspaceId = (workspaceId: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(StorageKey.WORKSPACE_ID, workspaceId);
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
  return MainRequest.get('/workspace-initialize');
}

export async function getWorkspaceByInviteCode(inviteCode: string) {
  return MainRequest.get<AppPageMetadata>(`/workspaces/invite/${inviteCode}/metadata`);
}

export async function getWorkspaceInviteInformation(inviteCode: string) {
  return MainRequest.get<WorkspaceInviteInformation>(`/workspaces/invite/${inviteCode}`);
}

export async function regenerateWorkspaceInviteCode() {
  return MainRequest.post<WorkspaceEntity>('/workspaces/regenerate-invite-code');
}

export async function getWorkspaceById(id: string) {
  return MainRequest.get<WorkspaceEntity>(`/workspaces/ids/${id}`);
}