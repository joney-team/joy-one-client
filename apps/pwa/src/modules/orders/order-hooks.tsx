import { t } from "@lingui/core/macro";
import { useWorkspace } from "../workspaces/workspace-context";
import { WorkspaceType } from "../workspaces/workspaces-types";

export const useOrderFeatureName = () => {
  const workspace = useWorkspace();

  if (
    [
      WorkspaceType.CLINIC,
      WorkspaceType.BEAUTY_SALON,
      WorkspaceType.SPA,
      WorkspaceType.HOSPITAL,
      WorkspaceType,
    ].includes(workspace.type)
  ) {
    return {
      singular: t`Ticket`,
      plural: t`Tickets`,
    };
  }

  return {
    singular: t`Order`,
    plural: t`Orders`,
  };
};
