import { useMutation } from "@apollo/client/react";

import { onError } from "@/utils/exceptions.utils";
import WORKSPACE_DATE_FRAGMENT from "../graphql/fragmentWorkspace.graphql";
import GenerateWorkspaceInviteCodeDocument from "../graphql/generateWorkspaceInviteCode.graphql";
import { useWorkspace } from "../workspace-context";

export const useGenerateWorkspaceInviteCode = () => {
  const { member } = useWorkspace();

  const [generateWorkspaceInviteCode, { loading }] = useMutation(
    GenerateWorkspaceInviteCodeDocument,
    {
      update: (cache, result) => {
        if (!result.data) return;
        cache.updateFragment(
          {
            id: `Workspace:${member.workspaceId}`,
            fragment: WORKSPACE_DATE_FRAGMENT,
            fragmentName: "Workspace",
          },
          (data) => {
            if (!data) return data;

            return {
              ...data,
              code: result.data?.inviteCode ?? data.code,
            };
          },
        );
      },
    },
  );

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
