import { getLocalStorage } from "@/hooks/use-local-storage";
import { AppPageMetadata, StorageKey } from "@/types";
import { isServer } from "@/utils/common.utils";
import {
  Icon,
  IconBuilding,
  IconBuildingHospital,
  IconCode,
  IconCreditCardPay,
  IconDental,
  IconPlant2,
  IconSparkles,
  IconStethoscope,
} from "@tabler/icons-react";
import { api } from "../apis";
import { WorkspaceEntity, WorkspaceInviteInformation } from "./workspaces-types";
import { WorkspaceType } from "@/graphql/enums.graphql";
import { UpdateWorkspaceMutationVariables } from "./graphql/mutationUpdateWorkspace.graphql";
import { WorkspaceDataFragment } from "./graphql/fragmentWorkspace.graphql";

export const getWorkspaceId = () => {
  if (isServer()) return;
  return getLocalStorage(StorageKey.WORKSPACE_ID);
};

export function getWorkspaceTypeIcon(type: WorkspaceType) {
  const workspaceTypeIcons: { [key in WorkspaceType]: Icon } = {
    [WorkspaceType.Hospital]: IconBuildingHospital,
    [WorkspaceType.Clinic]: IconStethoscope,
    [WorkspaceType.Dental]: IconDental,
    [WorkspaceType.Spa]: IconPlant2,
    [WorkspaceType.BeautySalon]: IconSparkles,
    [WorkspaceType.Business]: IconBuilding,
    [WorkspaceType.Credit]: IconCreditCardPay,
    [WorkspaceType.Software]: IconCode,
  };

  return workspaceTypeIcons[type];
}

export async function workspaceInitialize() {
  return api.get("/workspace-initialize");
}

export async function getWorkspaceByInviteCode(inviteCode: string) {
  return api.get<AppPageMetadata>(`/workspaces/invite/${inviteCode}/metadata`);
}

export async function getWorkspaceInviteInformation(inviteCode: string) {
  return api.get<WorkspaceInviteInformation>(`/workspaces/invite/${inviteCode}`);
}

export async function regenerateWorkspaceInviteCode() {
  return api.post<WorkspaceEntity>("/workspaces/regenerate-invite-code");
}

export async function getWorkspaceById(id: string) {
  return api.get<WorkspaceEntity>(`/workspaces/ids/${id}`);
}

export function normalizeWorkspaceInput(
  workspace: WorkspaceDataFragment
): UpdateWorkspaceMutationVariables {
  return {
    name: workspace?.name ?? "",
    phone: workspace?.phone ?? "",
    hotline: workspace?.hotline ?? "",
    location: workspace?.location
      ? {
          address: workspace?.location?.address ?? "",
        }
      : {},
    logo: workspace?.logo ?? "",
    appIcon: workspace?.appIcon ?? "",
    appColor: workspace?.appColor ?? "",
    appName: workspace?.appName ?? "",
    appColorShape: workspace?.appColorShape || 6,
    type: workspace.type,
    appDomain: workspace?.appDomain ?? "",
  };
}
