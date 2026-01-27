"use client";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";

import UPDATE_WORKSPACE_SETTING_MUTATION, {
  UpdateWorkspaceSettingMutationVariables,
} from "../graphql/mutationUpdateWorkspaceSetting.graphql";
import QUERY_WORKSPACE_SETTING from "../graphql/queryWorkspaceSetting.graphql";

import { WorkspaceView } from "@/graphql/types.graphql";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getDefaultWorkspaceView } from "../workspace-settings-view";
import { removeTypeName } from "@joy-one-client/utils/remove-type-name";
import { WorkspaceSettingDataFragment } from "../graphql/fragmentWorkspaceSetting.graphql";
import { useMemo } from "react";
import { Currency } from "@joy-one-client/utils/currency";

export const useWorkspaceSetting = () => {
  const client = useApolloClient();
  const { member } = useWorkspace();
  const { data } = useQuery(QUERY_WORKSPACE_SETTING);
  const { workspaceSetting } = data ?? {};

  const [handleUpdate] = useMutation(UPDATE_WORKSPACE_SETTING_MUTATION);

  const updateWorkspaceSetting = async (partial: Partial<WorkspaceSettingDataFragment>) => {
    if (!data?.workspaceSetting) return;
    const prevWorkspaceSetting = { ...data.workspaceSetting };

    try {
      const variables: UpdateWorkspaceSettingMutationVariables = removeTypeName({
        ...data.workspaceSetting,
        ...partial,
      });

      client.cache.updateQuery(
        {
          query: QUERY_WORKSPACE_SETTING,
        },
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            workspaceSetting: {
              ...prev.workspaceSetting,
              ...partial,
            },
          };
        }
      );

      const result = await handleUpdate({ variables });

      if (result.data?.updateWorkspaceSetting) {
        client.cache.updateQuery(
          {
            query: QUERY_WORKSPACE_SETTING,
          },
          (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              workspaceSetting: {
                ...prev.workspaceSetting,
                ...result.data?.updateWorkspaceSetting,
              },
            };
          }
        );
      }
    } catch (error) {
      client.cache.updateQuery(
        {
          query: QUERY_WORKSPACE_SETTING,
        },
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            workspaceSetting: prevWorkspaceSetting,
          };
        }
      );

      throw error;
    }
  };

  const getWorkspaceDisplayView = (view?: WorkspaceView) => {
    const defaultWorkspaceView = getDefaultWorkspaceView(member?.workspace?.type);
    let output = (view ?? { ...workspaceSetting?.view }) as WorkspaceView;

    Object.entries(defaultWorkspaceView).forEach(([key, value]) => {
      const viewKey = key as keyof WorkspaceView;
      if (!output[viewKey] && value) {
        output[viewKey] = value as any;
      }
    });

    return { ...output } as WorkspaceView;
  };

  const workspaceView: WorkspaceView = useMemo(() => {
    return (
      workspaceSetting?.view ?? {
        __typename: "WorkspaceView",
        menu: [],
        dashboardWidgets: [],
        reportWidgets: [],
      }
    );
  }, [workspaceSetting?.view]);

  const updateWorkspaceView = async (partial: Partial<WorkspaceView>) => {
    const view = { ...workspaceView, ...partial };
    await updateWorkspaceSetting({ view });
    return getWorkspaceDisplayView(view);
  };

  const resetWorkspaceView = async () => {
    await updateWorkspaceSetting({ view: null });
    return getWorkspaceDisplayView();
  };

  const isHrmTimekeepingAvailable = useMemo(() => {
    return (
      !!workspaceSetting?.hrmTimeKeepingsRules &&
      !!workspaceSetting?.hrmTimeKeepingsRules.acceptLocations &&
      workspaceSetting?.hrmTimeKeepingsRules.acceptLocations.length > 0
    );
  }, [workspaceSetting]);

  return {
    workspaceSetting,
    updateWorkspaceSetting,
    workspaceView,
    updateWorkspaceView,
    resetWorkspaceView,
    isHrmTimekeepingAvailable,
    currency: Currency.get(workspaceSetting?.currencyCode ?? "USD"),
  };
};
