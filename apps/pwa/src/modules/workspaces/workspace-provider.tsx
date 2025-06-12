"use client";

import { useApp } from "@/app.context";
import { Fullscreen } from "@/components/fullscreen";
import { defaultMetadata, getMetadata, setMetadata } from "@/configs/metadata.config";
import { getGlobal } from "@/global";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useRouter } from "@/hooks/use-router";
import { ConnectMetaPagesModal, OnConnectMetaPagesModal } from "@/modals/modal-connect-meta-pages";
import { useAuth } from "@/modules/auth/auth-context";
import { getWorkspaceAuthSessionId } from "@/modules/auth/auth-service";
import { onReconnected, useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { useLocations } from "@/modules/locations/locations-service";
import { getPluginMetaPagesInfo } from "@/modules/plugins/meta-pages/meta-pages-service";
import { getWorkspaceBalance } from "@/modules/workspace-billings/workspace-billings-service";
import { WorkspaceBalance } from "@/modules/workspace-billings/workspace-billings-types";
import {
  getMyWorkspaceMembers,
  getWorkspaceMemberOnlineStatus,
  joinWorkspaceMember,
  verifyWorkspaceMemberInvitation,
} from "@/modules/workspace-members/workspace-members-service";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
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
import { getWorkspaceSubscription } from "@/modules/workspace-subscriptions/workspace-subscriptions-service";
import { WorkspaceSubscriptionEntity } from "@/modules/workspace-subscriptions/workspace-subscriptions-types";
import { WorkspaceArchived } from "@/modules/workspaces/components/workspace-archived";
import { WorkspaceRequireBranches } from "@/modules/workspaces/components/workspace-require-branches";
import WorkspaceInvitation from "@/modules/workspaces/workspace-invitation";
import { getWorkspaceId, workspaceInitialize } from "@/modules/workspaces/workspaces-service";
import { isExtendedApp } from "@/service";
import { StorageKey } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { useDebouncedCallback, useForceUpdate } from "@mantine/hooks";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../apis";
import { Context } from "./workspace-context";
import { getWorkspaceModuleName, WorkspaceModuleId, workspaceModules } from "./workspace-modules";
import { WorkspaceRequire } from "./workspace-require";
import { getDefaultWorkspaceView } from "./workspace-view";
import {
  WorkspaceContext,
  WorkspaceDto,
  WorkspaceEntity,
  WorkspaceMemberInvitationState,
  WorkspaceType,
} from "./workspaces-types";
import { zIndexes } from "@joy-one-client/config/layout";

const syncSettings = (settings: WorkspaceSettingEntity) => {
  const global = getGlobal();
  global._workspaceSettings = settings;
};

const WorkspaceProvider: FC<PropsWithChildren> = (props) => {
  useLocations();

  const forceUpdate = useForceUpdate();
  const auth = useAuth();
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.inviteCode as string;
  const app = useApp();

  const [isInitialized, _setIsInitialized] = useState(false);
  const [isCreateNew, setIsCreateNew] = useState(false);
  const [invitationState, _setInvitationState] = useState<WorkspaceMemberInvitationState>();
  const [_, setWorkspaceId] = useLocalStorage(StorageKey.WORKSPACE_ID);

  const state = useRef<{
    activatedWorkspaceId?: string;
    balance?: WorkspaceBalance;
    subscription?: WorkspaceSubscriptionEntity;
    roles: WorkspaceRoleEntity[];
    settings?: WorkspaceSettingEntity;
    userMembers: WorkspaceMember[];
  }>({
    roles: [],
    userMembers: [],
  });

  const onlineStatus = useFetch({
    skip: !state.current.activatedWorkspaceId,
    fetch: () => getWorkspaceMemberOnlineStatus(),
    events: [
      EventType.SYNC_CLIENTS,
      EventType.WORKSPACE_MEMBER_LEAVED,
      EventType.WORKSPACE_MEMBER_JOINED,
    ],
  });

  const fetchUserMembers = async () => {
    const result = await getMyWorkspaceMembers();
    state.current.userMembers = result;
    forceUpdate();
    return result;
  };

  const fetchWorkspaceBalance = async () => {
    const result = await getWorkspaceBalance();
    state.current.balance = result;
    forceUpdate();
    return result;
  };

  const fetchRoles = async () => {
    const result = await getWorkspaceRoles();
    state.current.roles = result;
    forceUpdate();
    return result;
  };

  const fetchSettings = async () => {
    const result = await getWorkspaceSettings();
    syncSettings(result);
    state.current.settings = result;
    forceUpdate();
    return result;
  };

  const fetchSubscription = async () => {
    const result = await getWorkspaceSubscription();
    state.current.subscription = result;
    forceUpdate();
    return result;
  };

  const updateSettings = async (settings: WorkspaceSettingEntity) => {
    state.current.settings = settings;
    syncSettings(settings);
    forceUpdate();
    await setWorkspaceSettings(settings).catch(onError);
  };

  const select = (workspaceId: string) => {
    setWorkspaceId(workspaceId);
    _setIsInitialized(false);
    initialize();
  };

  const create = async (dto: WorkspaceDto) => {
    const workspace = await api.post<WorkspaceEntity>("/workspaces", dto);
    const userWorkspaces = await fetchUserMembers();
    const userWorkspace = userWorkspaces.find(
      (userWorkspace) => userWorkspace.workspaceId === workspace._id
    );
    if (userWorkspace && userWorkspace.workspaceId) select(userWorkspace.workspaceId);
  };

  const update = async (dto: WorkspaceDto) => {
    const workspace = await api.put(`/workspaces`, dto);
    await fetchUserMembers();
    return workspace;
  };

  const leave = () => {
    localStorage.removeItem(StorageKey.WORKSPACE_ID);
    state.current.activatedWorkspaceId = undefined;
    router.replace(`/`);
  };

  const archive = async () => {
    await api.delete(`/workspaces`);
    await fetchUserMembers();
    leave();
  };

  const fetchRelatedData = async () => {
    const initial = await workspaceInitialize();

    state.current.roles = initial.roles;
    state.current.balance = initial.balance;
    state.current.settings = initial.settings;

    // Check if the workspace is restricted to the current session
    if (state.current.settings?.isAuthSessionRestricted && !getWorkspaceAuthSessionId()) {
      auth.signOut();
      leave();
    }

    syncSettings(initial.settings);
    forceUpdate();
  };

  const onSetWorkspaceId = (workspaceId: string) => {
    setWorkspaceId(workspaceId);
    state.current.activatedWorkspaceId = workspaceId;
    forceUpdate();
  };

  const verifyInvitation = async () => {
    const search = new URLSearchParams(window.location.search);
    const invitationToken = search.get("invitation");
    if (invitationToken) {
      await verifyWorkspaceMemberInvitation(invitationToken)
        .then(async (res) => {
          // Check if the workspace is already in the list
          const userWorkspaces = await fetchUserMembers();
          const isAlreadyJoined = userWorkspaces.find((v) => v.userId === res.workspace._id);
          if (isAlreadyJoined) {
            setWorkspaceId(isAlreadyJoined.userId);
          } else {
            // If not, set the invitation state
            _setInvitationState({ invitation: res });
          }
        })
        .catch((error) => {
          const message = error.response?.data?.message || t("invalid_invitation");
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
      const userWorkspaces = await fetchUserMembers();
      await verifyInvitation();

      const userWorkspace = userWorkspaces.find(
        (userWorkspace) => userWorkspace.workspaceId === getWorkspaceId()
      );
      if (userWorkspace && userWorkspace.workspaceId) {
        await fetchRelatedData();
        onSetWorkspaceId(userWorkspace.workspaceId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      _setIsInitialized(true);
    }
  };

  const onChangeSettings = useDebouncedCallback(async (dto: SetWorkspaceSettingsDto) => {
    try {
      await setWorkspaceSettings(dto);
    } catch (error) {
      onError(error);
    }
  }, 500);

  const setSettings = async (dto: SetWorkspaceSettingsDto, exec?: boolean) => {
    state.current.settings = {
      ...state.current.settings,
      ...(dto as any),
    } as WorkspaceSettingEntity;
    syncSettings(state.current.settings);
    forceUpdate();
    if (exec) await setWorkspaceSettings(dto);
    else onChangeSettings(dto);
  };

  const getWorkspaceDisplayView = (_view?: WorkspaceView) => {
    let output: WorkspaceView = _view || { ...(state.current.settings?.view || {}) };
    const _default = getDefaultWorkspaceView(userMember?.workspace?.type);

    Object.keys(_default).forEach((key) => {
      if (!(output as any)[key]) (output as any)[key] = (_default as any)[key];
    });

    return { ...output };
  };

  const userMember = state.current.userMembers.find(
    (w) => w.workspaceId === state.current.activatedWorkspaceId
  );
  const workspaceView: WorkspaceView = state.current.settings?.view || {};

  const modules = Object.entries(workspaceModules).map(([id, mo]) => ({
    ...mo,
    id,
    name: getWorkspaceModuleName(id as keyof typeof workspaceModules, userMember?.workspace),
  }));

  const availableModules = modules.filter((mo) => {
    const _permissions = userMember?.permissions || [];
    const ableToAccess =
      (mo && !mo.permissions) ||
      mo.permissions
        ?.toString()
        .split(",")
        .every((p) => _permissions.includes(p as WorkspacePermission));

    const isAvailableType =
      !mo.workspaceTypes ||
      mo.workspaceTypes.includes(userMember?.workspace?.type || WorkspaceType.BUSINESS);
    return ableToAccess && isAvailableType;
  });

  const isUserOnline = (userId: string) => {
    return !!onlineStatus.data?.[userId];
  };

  const setView = async (_view: WorkspaceView) => {
    state.current.settings = { ...state.current.settings!, view: { ..._view } };
    syncSettings(state.current.settings);
    forceUpdate();
    await setSettings({ ...state.current.settings!, view: { ..._view } }, true);
    return getWorkspaceDisplayView(_view);
  };

  const resetView = async () => {
    state.current.settings = { ...state.current.settings!, view: undefined };
    syncSettings(state.current.settings);
    forceUpdate();
    await setSettings({ ...state.current.settings!, view: undefined }, true);
    return getWorkspaceDisplayView({});
  };

  const activatedModule = modules.find(
    (m) => router.pathname === m.href || (router.pathname.startsWith(m.href) && !m.hrefExact)
  );

  const onConnectMetaPages = async (accessToken: string) => {
    try {
      const { pages } = await getPluginMetaPagesInfo(accessToken);
      const canConnectPages = pages.filter((v) => v.status !== "CONNECTED");
      if (canConnectPages.length > 0)
        OnConnectMetaPagesModal({ pages: canConnectPages, accessToken });
      else localStorage.removeItem(StorageKey.META_ACCESS_TOKEN);
    } catch (error) {
      if (error instanceof AxiosError && error.status === 400) {
        localStorage.removeItem(StorageKey.META_ACCESS_TOKEN);
      } else {
        console.error(error);
      }
    }
  };

  useEventsListener(
    [EventType.WORKSPACE_SETTING_UPDATED],
    () => {
      fetchSettings();
    },
    [userMember?.workspaceId]
  );

  useEventsListener(
    [
      EventType.WORKSPACE_BILLINGS_DEPOSITED,
      EventType.WORKSPACE_BILLINGS_PAYMENT_NEW,
      EventType.WORKSPACE_BILLINGS_CASHBACK_NEW,
      EventType.WORKSPACE_BILLINGS_WITHDRAWN,
      EventType.WORKSPACE_BILLINGS_PAYMENT_PAID,
    ],
    () => {
      fetchWorkspaceBalance();
    }
  );

  useEventsListener(
    [
      EventType.WORKSPACE_BILLINGS_PAYMENT_NEW,
      EventType.WORKSPACE_BILLINGS_PAYMENT_PAID,
      EventType.WORKSPACE_SUBSCRIPTION_UPDATED,
    ],
    () => {
      fetchSubscription();
    }
  );

  useEventsListener(
    [
      EventType.WORKSPACE_ARCHIVED,
      EventType.WORKSPACE_ROLES_NEW,
      EventType.WORKSPACE_ROLES_UPDATED,
      EventType.WORKSPACE_SETTING_UPDATED,
      EventType.WORKSPACE_ROLES_REMOVED,
    ],
    () => {
      fetchRoles();
      fetchUserMembers();
    }
  );

  useEventsListener(
    [
      EventType.WORKSPACE_UPDATED,
      EventType.WORKSPACE_INVITE_CODE_UPDATED,
      EventType.WORKSPACE_MEMBER_JOINED,
      EventType.WORKSPACE_MEMBER_LEAVED,
      EventType.WORKSPACE_MEMBER_UPDATED,
      EventType.WORKSPACE_MEMBER_TRANSFER_OWNER,
      EventType.WORKSPACE_BRANCH_NEW,
      EventType.WORKSPACE_BRANCH_UPDATED,
    ],
    () => {
      initialize();
    }
  );

  useEffect(() => {
    if (userMember?.workspaceId) {
      app.joinWorkspaceRoom(userMember.workspaceId);
      fetchSubscription();
    }
  }, [userMember?.workspaceId]);

  useEffect(() => {
    if (auth.user?._id) initialize();
  }, [auth.user?._id]);

  onReconnected(() => {
    if (auth.user?._id) initialize();
  }, [auth.user?._id]);

  useEffect(() => {
    if (isInitialized && !auth.user?._id) {
      state.current.userMembers = [];
      state.current.activatedWorkspaceId = undefined;
      localStorage.removeItem(StorageKey.WORKSPACE_ID);
      _setIsInitialized(false);
    }
  }, [auth.user?._id, isInitialized]);

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
    if (userMember && userMember.permissions.includes(WorkspacePermission.WORKSPACE_SETTINGS)) {
      const accessToken = localStorage.getItem(StorageKey.META_ACCESS_TOKEN);
      if (accessToken) onConnectMetaPages(accessToken);
    }
  }, [userMember?.workspaceId, userMember]);

  const defaultWorkspaceRoles: WorkspaceRoleEntity[] = [
    {
      _id: WorkspaceSpecialRoleId.ADMIN,
      name: `role_${WorkspaceSpecialRoleId.ADMIN}`,
      color: "primary",
      permissions: Object.values(WorkspacePermission),
      workspaceId: "",
      createdAt: Date.now(),
    },
  ];

  const isRequireBranches =
    userMember &&
    userMember?.workspace.branches > 0 &&
    !userMember.workspaceBranches.length &&
    !userMember.permissions.includes(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS);

  const contextValue: WorkspaceContext = {
    onlineStatus: onlineStatus.data || {},
    activatedModule,
    type: userMember?.workspace?.type!,
    updateSettings,
    permissions: userMember?.permissions!,
    hasPermission: (permission: WorkspacePermission) =>
      userMember?.permissions.includes(permission) || false,
    roles: [...state.current.roles, ...defaultWorkspaceRoles],
    isInitialized,
    settings: state.current.settings!,
    currency: app.config?.currencies.find((c) => c.code === state.current.settings?.currencyCode) ||
      app.config?.currencies[0] || {
        code: "VND",
        symbol: "₫",
        name: "Vietnamese Dong",
        stepPrice: 1000,
      },
    userMember: userMember!,
    userMembers: state.current.userMembers,
    select,
    create,
    update,
    isUserOnline,
    leave,
    invitationState,
    leaveInvitation,
    workspaceSubscription: state.current.subscription ?? null,
    isHrmTimekeepingAvailable:
      !!state.current.settings &&
      !!state.current.settings.hrmTimeKeepingsRules &&
      !!state.current.settings.hrmTimeKeepingsRules.acceptLocations &&
      state.current.settings.hrmTimeKeepingsRules.acceptLocations.length > 0,
    balance: state.current.balance!,
    setSettings,
    view: workspaceView,
    setView,
    resetView,
    isModuleActive: (id: string) => availableModules.some((m) => m.id === id),
    modules,
    getModule: (id: WorkspaceModuleId) => modules.find((m) => m.id === id)!,
    getModuleName: (id: WorkspaceModuleId) => getWorkspaceModuleName(id, userMember?.workspace),
    availableModules: availableModules,
    isCreateNew,
    setIsCreateNew,
    archive,
    join,
    ref: `${userMember?.workspaceId || "WS"}`,
    isShouldEnableBranches:
      !!userMember &&
      userMember.workspace.branches > 0 &&
      (userMember.workspaceBranches.length > 1 ||
        userMember.permissions.includes(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS)),
    isShowBranches: !!userMember && userMember.workspace.branches > 0,
    defaultBranch: userMember?.workspaceBranches[0],
    isAvailable: !!auth.user && !!userMember,
  };

  const Component = useMemo(() => {
    if (!isInitialized || !auth.user) return null;
    if (inviteCode) return <WorkspaceInvitation inviteCode={inviteCode} />;
    if (!userMember) return <WorkspaceRequire workspace={contextValue} />;
    if (isRequireBranches) return <WorkspaceRequireBranches workspace={contextValue} />;
    if (userMember.workspace.isArchived) return <WorkspaceArchived workspace={contextValue} />;
  }, [isInitialized, inviteCode, userMember, isRequireBranches, auth.user]);

  return (
    <Context.Provider value={contextValue}>
      {Component && <Fullscreen zIndex={zIndexes.requireWorkspace}>{Component}</Fullscreen>}

      {props.children}
      <ConnectMetaPagesModal />
    </Context.Provider>
  );
};

export default WorkspaceProvider;
