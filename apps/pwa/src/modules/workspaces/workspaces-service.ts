import { StorageKey } from "@/constants/storage-key";
import { getLocalStorage } from "@/hooks/use-local-storage";
import { isServer } from "@/utils/common.utils";
import { WorkspaceFragment } from "./graphql/fragmentWorkspace.graphql";
import { UpdateWorkspaceMutationVariables } from "./graphql/mutationUpdateWorkspace.graphql";

export const getWorkspaceId = () => {
  if (isServer()) return;
  return getLocalStorage(StorageKey.WORKSPACE_ID);
};

export function normalizeWorkspaceInput(
  workspace: WorkspaceFragment,
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
