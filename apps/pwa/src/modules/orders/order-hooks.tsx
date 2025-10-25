import { tl } from "../lang/lang-service";
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
      singular: tl("ticket"),
      plural: tl("tickets"),
    };
  }

  return {
    singular: tl("order"),
    plural: tl("orders"),
  };
};
