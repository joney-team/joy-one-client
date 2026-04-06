import { StorageKey } from "@/constants/storage-key";
import { WorkspaceInput } from "@/graphql/types.graphql";
import { getLocalStorage } from "@/hooks/use-local-storage";
import { isServer } from "@/utils/common.utils";
import { WorkspaceFragment } from "./graphql/fragmentWorkspace.graphql";

export const getWorkspaceId = () => {
  if (isServer()) return;
  return getLocalStorage(StorageKey.WORKSPACE_ID);
};

export function normalizeWorkspaceInput(workspace: WorkspaceFragment): WorkspaceInput {
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
    type: workspace.type,
    appDomain: workspace?.appDomain ?? "",
  };
}
