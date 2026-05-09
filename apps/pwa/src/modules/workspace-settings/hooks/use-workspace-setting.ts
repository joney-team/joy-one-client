"use client";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";

import { UpdateWorkspaceSettingInput, WorkspaceView } from "@/graphql/types.graphql";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Currency } from "@joy-one/utils/currency";
import { normalizeObject } from "@joy-one/utils/object";
import { removeTypeName } from "@joy-one/utils/remove-type-name";
import { useMemo } from "react";
import { WorkspaceSettingFragment } from "../graphql/fragmentWorkspaceSetting.graphql";
import GetWorkspaceSettingDocument from "../graphql/getWorkspaceSetting.graphql";
import UpdateWorkspaceSettingDocument from "../graphql/updateWorkspaceSetting.graphql";
import { getDefaultWorkspaceView } from "../workspace-settings-view";

export const useWorkspaceSetting = () => {
  const client = useApolloClient();
  const { member } = useWorkspace();
  const { data } = useQuery(GetWorkspaceSettingDocument, { skip: !member });

  const workspaceSetting = useMemo(() => {
    if (data) return normalizeObject(data.workspaceSetting);
    return null;
  }, [data]);

  const [handleUpdate] = useMutation(UpdateWorkspaceSettingDocument);

  const updateWorkspaceSetting = async (partial: Partial<WorkspaceSettingFragment>) => {
    if (!data?.workspaceSetting) return;
    const prevWorkspaceSetting = { ...data.workspaceSetting };

    try {
      client.cache.updateQuery(
        {
          query: GetWorkspaceSettingDocument,
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

      const values: UpdateWorkspaceSettingInput = removeTypeName({
        ...data.workspaceSetting,
        ...partial,
      });

      const result = await handleUpdate({
        variables: {
          input: {
            allowDuplicateBookings: values.allowDuplicateBookings,
            currencyCode: values.currencyCode,
            view: values.view,
            allowPayTicketMultipleTimes: values.allowPayTicketMultipleTimes,
            allowTip: values.allowTip,
            bankAccount: values.bankAccount,
            bookingsAutoRemindCustomerBookingBeforeDays:
              values.bookingsAutoRemindCustomerBookingBeforeDays,
            bookingsAutoRemindCustomerBookingTime: values.bookingsAutoRemindCustomerBookingTime,
            isAuthSessionRestricted: values.isAuthSessionRestricted,
            loanSettings: values.loanSettings,
            mailer: values.mailer,
            memberPermissions: values.memberPermissions,
            privacyPolicy: values.privacyPolicy,
            receiptImagesRequired: values.receiptImagesRequired,
            receiptPaymentMethodDefault: values.receiptPaymentMethodDefault,
            schedule: values.schedule,
            searchSettings: values.searchSettings,
            termsOfService: values.termsOfService,
            zaloOaGmfGroupSettings: values.zaloOaGmfGroupSettings,
          },
        },
      });

      if (result.data?.workspaceSetting) {
        client.cache.updateQuery(
          {
            query: GetWorkspaceSettingDocument,
          },
          (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              workspaceSetting: {
                ...prev.workspaceSetting,
                ...result.data?.workspaceSetting,
              },
            };
          },
        );
      }
    } catch (error) {
      client.cache.updateQuery(
        {
          query: GetWorkspaceSettingDocument,
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

    console.log("partial", partial);

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
