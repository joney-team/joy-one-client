"use client";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";

import UPDATE_WORKSPACE_SETTING_MUTATION, {
  UpdateWorkspaceSettingMutationVariables,
} from "../graphql/mutationUpdateWorkspaceSetting.graphql";
import QUERY_WORKSPACE_SETTING from "../graphql/queryWorkspaceSetting.graphql";

import { WorkspaceView } from "@/graphql/types.graphql";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Currency } from "@joy-one-client/utils/currency";
import { normalizeObject } from "@joy-one-client/utils/object";
import { removeTypeName } from "@joy-one-client/utils/remove-type-name";
import { useMemo } from "react";
import { WorkspaceSettingFragment } from "../graphql/fragmentWorkspaceSetting.graphql";
import { getDefaultWorkspaceView } from "../workspace-settings-view";

export const useWorkspaceSetting = () => {
  const client = useApolloClient();
  const { member } = useWorkspace();
  const { data } = useQuery(QUERY_WORKSPACE_SETTING, { skip: !member });

  const workspaceSetting = useMemo(() => {
    if (data) return normalizeObject(data.workspaceSetting);
    return null;
  }, [data]);

  const [handleUpdate] = useMutation(UPDATE_WORKSPACE_SETTING_MUTATION);

  const updateWorkspaceSetting = async (partial: Partial<WorkspaceSettingFragment>) => {
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
        },
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
          },
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
        },
      );

      throw error;
    }
  };

  const getWorkspaceDisplayView = (view?: Partial<WorkspaceView>) => {
    const defaultWorkspaceView = getDefaultWorkspaceView(member?.workspace?.type);
    let output = (view ?? { ...workspaceSetting?.view }) as WorkspaceView;

    Object.entries(defaultWorkspaceView).forEach(([key, value]) => {
      const viewKey = key as keyof WorkspaceView;
      if (!output[viewKey]) {
        output[viewKey] = value as any;
      }
    });

    return { ...output } as WorkspaceView;
  };

  const workspaceViewValue: WorkspaceView | undefined = useMemo(() => {
    return workspaceSetting?.view ?? undefined;
  }, [workspaceSetting?.view]);

  const workspaceView: WorkspaceView = useMemo(() => {
    return getWorkspaceDisplayView(workspaceViewValue);
  }, [workspaceViewValue]);

  const updateWorkspaceView = async (partial: Partial<WorkspaceView>) => {
    const view = { ...workspaceViewValue, ...partial };

    updateWorkspaceSetting({
      view: {
        __typename: "WorkspaceView",
        menu: view.menu ?? null,
        dashboardWidgets: view.dashboardWidgets ?? null,
        reportWidgets: view.reportWidgets ?? null,
      },
    });

    return getWorkspaceDisplayView(view);
  };

  const resetWorkspaceView = async () => {
    updateWorkspaceSetting({ view: null });
    return getWorkspaceDisplayView();
  };

  return {
    workspaceSetting,
    updateWorkspaceSetting,
    workspaceViewValue,
    workspaceView,
    updateWorkspaceView,
    resetWorkspaceView,
    currency: Currency.get(workspaceSetting?.currencyCode ?? "USD"),
  };
};
