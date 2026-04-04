import { useMutation } from "@apollo/client/react";

import WORKSPACE_DATE_FRAGMENT from "../graphql/fragmentWorkspace.graphql";
import UpdateWorkspaceDocument from "../graphql/updateWorkspace.graphql";

export const useUpdateWorkspace = () => {
  const [updateWorkspace, { loading }] = useMutation(UpdateWorkspaceDocument, {
    update: (cache, result) => {
      if (!result.data) return;
      cache.updateFragment(
        {
          id: `Workspace:${result.data.workspace._id}`,
          fragment: WORKSPACE_DATE_FRAGMENT,
          fragmentName: "Workspace",
        },
        (data) => {
          if (!data) return data;

          return {
            ...data,
            ...result.data?.workspace,
          };
        },
      );
    },
  });

  return {
    updateWorkspace,
    loading,
  };
};
