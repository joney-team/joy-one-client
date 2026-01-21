import { t } from "@lingui/core/macro";
import { useWorkspace } from "../workspaces/workspace-context";
import { WorkspaceType } from "@/graphql/enums.graphql";

export const useOrderFeatureName = () => {
  const workspace = useWorkspace();

  if (
    [WorkspaceType.Clinic, WorkspaceType.BeautySalon, WorkspaceType.Spa, WorkspaceType.Hospital]
      .map((t) => t.toString())
      .includes(workspace.member.workspace.type)
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
