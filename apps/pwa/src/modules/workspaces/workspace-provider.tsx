"use client";

import { useApp } from "@/app.context";
import { endAppLoading, startAppLoading } from "@/components/app-loading/app-loading";
import { defaultMetadata, getMetadata, setMetadata } from "@/configs/metadata.config";
import { EventType } from "@/graphql/enums.graphql";
import { getLocalStorage, useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/modules/auth/auth-context";
import { getWorkspaceAuthSessionId } from "@/modules/auth/auth-service";
import { useEventsListener } from "@/modules/events/event-service";
import { joinWorkspaceMember } from "@/modules/workspace-members/workspace-members-service";
import { getWorkspaceRoles } from "@/modules/workspace-roles/workspace-roles-service";
import {
  WorkspaceDefaultRoleId,
  WorkspacePermission,
  WorkspaceRoleEntity,
} from "@/modules/workspace-roles/workspace-roles-types";
import {
  getWorkspaceSettings,
  setWorkspaceSettings,
} from "@/modules/workspace-settings/workspace-settings-service";
import {
  SetWorkspaceSettingsDto,
  WorkspaceSettingEntity,
  WorkspaceView,
} from "@/modules/workspace-settings/workspace-settings-types";
import { workspaceInitialize } from "@/modules/workspaces/workspaces-service";
import { isExtendedApp } from "@/service";
import { StorageKey } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";
import { Currency } from "@joy-one-client/utils/currency";
import { removeParams } from "@joy-one-client/utils/location-query";
import { runWithDelay } from "@joy-one-client/utils/run-with-delay";
import { useDebouncedCallback, useForceUpdate } from "@mantine/hooks";
import * as Sentry from "@sentry/react";
import { useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../apis";
import QUERY_USER_WORKSPACE_MEMBERS from "../workspace-members/graphql/queryUserWorkspaceMembers.graphql";
import { Context } from "./workspace-context";
import { getDefaultWorkspaceView } from "./workspace-view";
import {
  WorkspaceContext,
  WorkspaceDto,
  WorkspaceEntity,
  WorkspaceMemberInvitationState,
} from "./workspaces-types";

const WorkspaceProvider: FC<PropsWithChildren> = (props) => {
  const client = useApolloClient();
  const forceUpdate = useForceUpdate();
  const auth = useAuth();
  const router = useRouter();
  const app = useApp();

  const state = useRef<{
    settings?: WorkspaceSettingEntity;
  }>({});

  const [isInitialized, _setIsInitialized] = useState(false);
  const [isCreateNew, setIsCreateNew] = useState(false);
  const [invitationState, _setInvitationState] = useState<WorkspaceMemberInvitationState>();
  const [workspaceId, setWorkspaceId] = useLocalStorage(StorageKey.WORKSPACE_ID);

  const workspaceView: WorkspaceView = state.current.settings?.view || {};

  const [getWorkspaceMembers, { data: workspaceMembersData }] = useLazyQuery(
    QUERY_USER_WORKSPACE_MEMBERS,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
    }
  );

  const member = useMemo(
    () =>
      auth.user
        ? workspaceMembersData?.userWorkspaceMembers.find((w) => w.workspaceId === workspaceId)
        : undefined,
    [workspaceMembersData, workspaceId]
  );

  useEventsListener(
    [EventType.WorkspaceMemberSynced],
    (e) => {
      if (e.userId === member?.userId) {
        getWorkspaceMembers();
      }
    },
    [member?.userId]
  );

  const fetchSettings = async () => {
    const result = await getWorkspaceSettings();
    state.current.settings = result;
    forceUpdate();
    return result;
  };

  const updateSettings = async (settings: WorkspaceSettingEntity) => {
    state.current.settings = settings;
    forceUpdate();
    await setWorkspaceSettings(settings).catch(onError);
  };

  const select = async (workspaceId: string) => {
    startAppLoading("initial-workspace");
    setWorkspaceId(workspaceId);
    client.cache.reset();
    await initialize();
  };

  const create = async (dto: WorkspaceDto) => {
    const workspace = await api.post<WorkspaceEntity>("/workspaces", dto);
    const result = await getWorkspaceMembers();

    const userWorkspace = result.data?.userWorkspaceMembers.find(
      (userWorkspace) => userWorkspace.workspaceId === workspace._id
    );

    if (userWorkspace) select(userWorkspace.workspaceId);
  };

  const leave = () => {
    setWorkspaceId(undefined);
    router.replace(`/`);
  };

  const archive = async () => {
    await api.delete(`/workspaces`);
    await getWorkspaceMembers();
    leave();
  };

  const fetchRelatedData = async () => {
    try {
      const initial = await workspaceInitialize();
      state.current.settings = initial.settings;

      // Check if the workspace is restricted to the current session
      if (state.current.settings?.isAuthSessionRestricted && !getWorkspaceAuthSessionId()) {
        auth.signOut();
        leave();
      }

      forceUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const join = async (code: string) => {
    const result = await joinWorkspaceMember(code);
    if (result.workspaceId) setWorkspaceId(result.workspaceId);
    await initialize();
  };

  const leaveInvitation = () => {
    router.replace("/");
    _setInvitationState(undefined);
  };

  const initialize = async () => {
    try {
      await runWithDelay(async () => {
        // Auto set workspace id when app is extended
        if (app.metadata.isExtended && app.metadata.workspaceId) {
          setWorkspaceId(app.metadata.workspaceId);
        }

        const result = await getWorkspaceMembers();
        const workspaceMember = result.data?.userWorkspaceMembers.find(
          (member) => member.workspaceId === workspaceId
        );

        if (workspaceMember && workspaceMember.workspaceId) {
          await fetchRelatedData();
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      _setIsInitialized(true);
      endAppLoading("initial-workspace");
    }
  };

  const onChangeSettings = useDebouncedCallback(async (dto: SetWorkspaceSettingsDto) => {
    try {
      await setWorkspaceSettings(dto);
    } catch (error) {
      onError(error);
    }
  }, 500);

  const setSettings = async (dto: Partial<SetWorkspaceSettingsDto>, exec?: boolean) => {
    state.current.settings = {
      ...state.current.settings,
      ...(dto as any),
    } as WorkspaceSettingEntity;
    forceUpdate();
    if (exec) await setWorkspaceSettings(state.current.settings);
    else onChangeSettings(state.current.settings);
  };

  const getWorkspaceDisplayView = (_view?: WorkspaceView) => {
    let output: WorkspaceView = _view || { ...(state.current.settings?.view || {}) };
    const _default = getDefaultWorkspaceView(member?.workspace?.type);

    Object.keys(_default).forEach((key) => {
      if (!(output as any)[key]) (output as any)[key] = (_default as any)[key];
    });

    return { ...output };
  };

  const setView = async (_view: WorkspaceView) => {
    state.current.settings = { ...state.current.settings!, view: { ..._view } };
    forceUpdate();
    await setSettings({ ...state.current.settings!, view: { ..._view } }, true);
    return getWorkspaceDisplayView(_view);
  };

  const resetView = async () => {
    state.current.settings = { ...state.current.settings!, view: undefined };
    forceUpdate();
    await setSettings({ ...state.current.settings!, view: undefined }, true);
    return getWorkspaceDisplayView({});
  };

  useEventsListener([EventType.WorkspaceSettingUpdated], fetchSettings, [member?.workspaceId]);

  useEventsListener(
    [
      EventType.WorkspaceArchived,
      EventType.WorkspaceRolesNew,
      EventType.WorkspaceRolesUpdated,
      EventType.WorkspaceRolesRemoved,
      EventType.WorkspaceSettingUpdated,
      EventType.WorkspaceInviteCodeUpdated,
      EventType.WorkspaceMemberTransferOwner,
      EventType.WorkspaceBranchNew,
    ],
    () => {
      getWorkspaceMembers();
    }
  );

  useEventsListener(
    [
      EventType.WorkspaceUpdated,
      EventType.WorkspaceMemberJoined,
      EventType.WorkspaceMemberLeaved,
      EventType.WorkspaceMemberUpdated,
      EventType.WorkspaceMemberTransferOwner,
      EventType.WorkspaceBranchNew,
      EventType.WorkspaceBranchUpdated,
    ],
    () => fetchRelatedData()
  );

  useEffect(() => {
    if (member) {
      app.joinWorkspaceRoom(member.workspaceId);

      if (!isExtendedApp()) {
        setMetadata({
          ...getMetadata(),
          appColor: member.workspace.appColor || defaultMetadata.appColor,
          appName: member.workspace.appName || defaultMetadata.appName,
          appIcon: member.workspace.appIcon || defaultMetadata.appIcon,
          appColorShape: member.workspace.appColorShape || defaultMetadata.appColorShape,
        });
      }

      // Add workspace code and name to Sentry
      Sentry.setExtra("Workspace", {
        code: contextValue.member.workspace.code,
        name: contextValue.member.workspace.name,
      });
    }
  }, [member]);

  useEffect(() => {
    if (auth.isInitialized) {
      if (auth.user?._id) {
        initialize();
      } else {
        setWorkspaceId(undefined);
        _setIsInitialized(false);
      }
    }
  }, [auth.user?._id, auth.isInitialized, workspaceId]);

  const isShouldEnableBranches =
    !!member &&
    member.workspace.branches > 0 &&
    (member.workspaceBranches.length > 1 ||
      member.permissions.includes(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS));

  const contextValue: WorkspaceContext = {
    type: member?.workspace?.type!,
    updateSettings,
    hasPermission: (permission: WorkspacePermission) =>
      member?.permissions.includes(permission) ?? false,
    isInitialized,
    settings: state.current.settings!,
    currency: Currency.get(state.current.settings?.currencyCode) || Currency.get()!,
    member: member!,
    userMembers: workspaceMembersData?.userWorkspaceMembers ?? [],
    select,
    create,
    leave,
    invitationState,
    leaveInvitation,
    isHrmTimekeepingAvailable:
      !!state.current.settings &&
      !!state.current.settings.hrmTimeKeepingsRules &&
      !!state.current.settings.hrmTimeKeepingsRules.acceptLocations &&
      state.current.settings.hrmTimeKeepingsRules.acceptLocations.length > 0,
    setSettings,
    view: workspaceView,
    setView,
    resetView,
    isCreateNew,
    setIsCreateNew,
    archive,
    join,
    ref: `${member?.workspaceId || "WS"}`,
    isHasAccessAllBranches:
      !!member && member.permissions.includes(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS),
    isShouldEnableBranches,
    isShowBranches: !!member && member.workspace.branches > 0,
    defaultBranch: member?.workspaceBranches[0],
    isAvailable: isInitialized && !!auth.user && !!member && !!state.current.settings,
  };

  // Auto switch workspace when url has query param "w"
  useEffect(() => {
    if (isInitialized && contextValue.userMembers.length > 0) {
      const query = new URLSearchParams(window.location.search);
      const workspaceId = query.get("w");
      const userMember = contextValue.userMembers.find((m) => m.workspaceId === workspaceId);
      const currentWorkspaceId = getLocalStorage(StorageKey.WORKSPACE_ID);
      if (userMember && userMember.workspaceId !== currentWorkspaceId) {
        router.replace(removeParams("w"));
        select(userMember.workspaceId);
      }
    }
  }, [isInitialized, contextValue.userMembers]);

  return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
};

export default WorkspaceProvider;
