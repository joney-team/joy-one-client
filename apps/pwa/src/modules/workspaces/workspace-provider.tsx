"use client";

import { useApp } from "@/app.context";
import { endAppLoading, startAppLoading } from "@/components/app-loading/app-loading";
import { defaultMetadata, getMetadata, setMetadata } from "@/configs/metadata.config";
import { EventType } from "@/graphql/enums.graphql";
import { getLocalStorage, useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/modules/auth/auth-context";
import { getWorkspaceAuthSessionId } from "@/modules/auth/auth-service";
import { useEventsListener } from "@/modules/events/event-service";
import {
  getMyWorkspaceMembers,
  joinWorkspaceMember,
  verifyWorkspaceMemberInvitation,
} from "@/modules/workspace-members/workspace-members-service";
import {
  WorkspaceMember,
  WorkspaceMemberOnlineStatus,
} from "@/modules/workspace-members/workspace-members-types";
import { getWorkspaceRoles } from "@/modules/workspace-roles/workspace-roles-service";
import {
  WorkspacePermission,
  WorkspaceRoleEntity,
  WorkspaceSpecialRoleId,
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
import { useApolloClient } from "@apollo/client/react";
import { Currency } from "@joy-one-client/utils/currency";
import { removeParams } from "@joy-one-client/utils/location-query";
import { runWithDelay } from "@joy-one-client/utils/run-with-delay";
import { useLingui } from "@lingui/react/macro";
import { useDebouncedCallback, useForceUpdate } from "@mantine/hooks";
import * as Sentry from "@sentry/react";
import { useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { api } from "../apis";
import { useRestQuery } from "../apis/use-rest-query";
import { Context } from "./workspace-context";
import { getDefaultWorkspaceView } from "./workspace-view";
import {
  WorkspaceContext,
  WorkspaceDto,
  WorkspaceEntity,
  WorkspaceMemberInvitationState,
} from "./workspaces-types";

const WorkspaceProvider: FC<PropsWithChildren> = (props) => {
  const { t } = useLingui();
  const client = useApolloClient();
  const forceUpdate = useForceUpdate();
  const auth = useAuth();
  const router = useRouter();
  const app = useApp();

  const state = useRef<{
    roles: WorkspaceRoleEntity[];
    settings?: WorkspaceSettingEntity;
    workspaceMembers: WorkspaceMember[];
  }>({
    roles: [],
    workspaceMembers: [],
  });

  const [isInitialized, _setIsInitialized] = useState(false);
  const [isCreateNew, setIsCreateNew] = useState(false);
  const [invitationState, _setInvitationState] = useState<WorkspaceMemberInvitationState>();
  const [workspaceId, setWorkspaceId] = useLocalStorage(StorageKey.WORKSPACE_ID);
  const userMember = auth.user
    ? state.current.workspaceMembers.find((w) => w.workspaceId === workspaceId)
    : undefined;

  const workspaceView: WorkspaceView = state.current.settings?.view || {};

  const onlineStatus = useRestQuery<WorkspaceMemberOnlineStatus>({
    isSkip: !userMember,
    route: "/workspace-members/online-status",
    refetchEvents: [
      EventType.WorkspaceMemberLeaved,
      EventType.WorkspaceMemberJoined,
      EventType.WorkspaceMemberOnline,
      EventType.WorkspaceMemberOffline,
    ],
  });

  const fetchUserWorkspaceMembers = async () => {
    state.current.workspaceMembers = await getMyWorkspaceMembers();
    forceUpdate();
  };

  const fetchRoles = async () => {
    const result = await getWorkspaceRoles();
    state.current.roles = result;
    forceUpdate();
    return result;
  };

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
    await fetchUserWorkspaceMembers();

    const userWorkspace = state.current.workspaceMembers.find(
      (userWorkspace) => userWorkspace.workspaceId === workspace._id
    );

    if (userWorkspace) select(userWorkspace.workspaceId);
  };

  const update = async (dto: WorkspaceDto) => {
    const workspace = await api.put(`/workspaces`, dto);
    await fetchUserWorkspaceMembers();
    return workspace;
  };

  const leave = () => {
    setWorkspaceId(undefined);
    router.replace(`/`);
  };

  const archive = async () => {
    await api.delete(`/workspaces`);
    await fetchUserWorkspaceMembers();
    leave();
  };

  const fetchRelatedData = async () => {
    try {
      const initial = await workspaceInitialize();

      state.current.roles = initial.roles;
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

  const verifyInvitation = async () => {
    const search = new URLSearchParams(window.location.search);
    const invitationToken = search.get("invitation");
    if (invitationToken) {
      await verifyWorkspaceMemberInvitation(invitationToken)
        .then(async (res) => {
          // Check if the workspace is already in the list
          await fetchUserWorkspaceMembers();
          const isAlreadyJoined = state.current.workspaceMembers.find(
            (v) => v.userId === res.workspace._id
          );
          if (isAlreadyJoined) {
            setWorkspaceId(isAlreadyJoined.userId);
          } else {
            // If not, set the invitation state
            _setInvitationState({ invitation: res });
          }
        })
        .catch((error) => {
          const message = error.response?.data?.message || t`Invalid invitation`;
          _setInvitationState({ error: message });
        });
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

        await fetchUserWorkspaceMembers();
        await verifyInvitation();

        const workspaceMember = state.current.workspaceMembers.find(
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
    const _default = getDefaultWorkspaceView(userMember?.workspace?.type);

    Object.keys(_default).forEach((key) => {
      if (!(output as any)[key]) (output as any)[key] = (_default as any)[key];
    });

    return { ...output };
  };

  const isUserOnline = (userId: string) => {
    return !!onlineStatus.data?.[userId] || false;
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

  useEventsListener([EventType.WorkspaceSettingUpdated], fetchSettings, [workspaceId]);

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
      fetchRoles();
      fetchUserWorkspaceMembers();
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
    if (userMember) {
      app.joinWorkspaceRoom(userMember.workspaceId);
    }
  }, [userMember]);

  useEffect(() => {
    if (userMember && !isExtendedApp()) {
      setMetadata({
        ...getMetadata(),
        appColor: userMember.workspace.appColor || defaultMetadata.appColor,
        appName: userMember.workspace.appName || defaultMetadata.appName,
        appIcon: userMember.workspace.appIcon || defaultMetadata.appIcon,
        appColorShape: userMember.workspace.appColorShape || defaultMetadata.appColorShape,
      });
    }
  }, [userMember]);

  useEffect(() => {
    if (auth.isInitialized) {
      if (auth.user?._id) {
        initialize();
      } else {
        state.current.workspaceMembers = [];
        setWorkspaceId(undefined);
        _setIsInitialized(false);
      }
    }
  }, [auth.user?._id, auth.isInitialized, workspaceId]);

  const defaultWorkspaceRoles: WorkspaceRoleEntity[] = [
    {
      _id: WorkspaceSpecialRoleId.ADMIN,
      name: WorkspaceSpecialRoleId.ADMIN,
      color: "primary",
      permissions: Object.values(WorkspacePermission),
      workspaceId: "",
      createdAt: Date.now(),
    },
  ];

  const isShouldEnableBranches =
    !!userMember &&
    userMember.workspace.branches > 0 &&
    (userMember.workspaceBranches.length > 1 ||
      userMember.permissions.includes(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS));

  const contextValue: WorkspaceContext = {
    onlineStatus: onlineStatus.data || {},
    type: userMember?.workspace?.type!,
    updateSettings,
    permissions: userMember?.permissions!,
    hasPermission: (permission: WorkspacePermission) =>
      userMember?.permissions.includes(permission) || false,
    roles: [...state.current.roles, ...defaultWorkspaceRoles],
    isInitialized,
    settings: state.current.settings!,
    currency: Currency.get(state.current.settings?.currencyCode) || Currency.get()!,
    userMember: userMember!,
    userMembers: state.current.workspaceMembers,
    select,
    create,
    update,
    isUserOnline,
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
    ref: `${userMember?.workspaceId || "WS"}`,
    isHasAccessAllBranches:
      !!userMember &&
      userMember.permissions.includes(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS),
    isShouldEnableBranches,
    isShowBranches: !!userMember && userMember.workspace.branches > 0,
    defaultBranch: userMember?.workspaceBranches[0],
    isAvailable: isInitialized && !!auth.user && !!userMember && !!state.current.settings,
  };

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

  useEffect(() => {
    if (contextValue.userMember) {
      Sentry.setExtra("Workspace", {
        code: contextValue.userMember.workspace.code,
        name: contextValue.userMember.workspace.name,
      });
    }
  }, [contextValue.userMember]);

  return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
};

export default WorkspaceProvider;
