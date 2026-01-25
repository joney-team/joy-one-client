import { useMutation } from "@apollo/client/react";

import WORKSPACE_DATE_FRAGMENT from "../graphql/fragmentWorkspace.graphql";
import GENERATE_WORKSPACE_INVITE_CODE from "../graphql/mutationGenerateWorkspaceInviteCode.graphql";
import { useWorkspace } from "../workspace-context";
import { onError } from "@/utils/exceptions.utils";

export const useGenerateWorkspaceInviteCode = () => {
  const { member } = useWorkspace();

  const [generateWorkspaceInviteCode, { loading }] = useMutation(GENERATE_WORKSPACE_INVITE_CODE, {
    update: (cache, result) => {
      if (!result.data) return;
      cache.updateFragment(
        {
          id: `Workspace:${member.workspaceId}`,
          fragment: WORKSPACE_DATE_FRAGMENT,
          fragmentName: "WorkspaceData",
        },
        (data) => {
          if (!data) return data;

          return {
            ...data,
            code: result.data?.generateWorkspaceInviteCode ?? data.code,
          };
        }
      );
    },
  });

  return {
    generateWorkspaceInviteCode: async () => {
      try {
        await generateWorkspaceInviteCode();
      } catch (error) {
        onError(error);
      }
    },
    loading,
  };
};
