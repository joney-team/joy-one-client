import { t } from "../lang/lang-service";
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
      singular: t("ticket"),
      plural: t("tickets"),
    };
  }

  return {
    singular: t("order"),
    plural: t("orders"),
  };
};
