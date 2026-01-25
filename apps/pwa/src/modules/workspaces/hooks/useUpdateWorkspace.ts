import { useMutation } from "@apollo/client/react";

import WORKSPACE_DATE_FRAGMENT from "../graphql/fragmentWorkspace.graphql";
import UPDATE_WORKSPACE_MUTATION from "../graphql/mutationUpdateWorkspace.graphql";

export const useUpdateWorkspace = () => {
  const [updateWorkspace, { loading }] = useMutation(UPDATE_WORKSPACE_MUTATION, {
    update: (cache, result) => {
      if (!result.data) return;
      cache.updateFragment(
        {
          id: `Workspace:${result.data.updateWorkspace._id}`,
          fragment: WORKSPACE_DATE_FRAGMENT,
          fragmentName: "WorkspaceData",
        },
        (data) => {
          if (!data) return data;

          return {
            ...data,
            ...result.data?.updateWorkspace,
          };
        }
      );
    },
  });

  return {
    updateWorkspace,
    loading,
  };
};
