"use client";

import { useApp } from "@/app.context";
import { endAppLoading, startAppLoading } from "@/components/app-loading/app-loading";
import { defaultMetadata, getMetadata, setMetadata } from "@/configs/metadata.config";
import { EventType } from "@/graphql/enums.graphql";
import { getLocalStorage, useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/modules/auth/auth-context";
import { useEventsListener } from "@/modules/events/event-service";
import { joinWorkspaceMember } from "@/modules/workspace-members/workspace-members-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { isExtendedApp } from "@/service";
import { StorageKey } from "@/types";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";
import { removeParams } from "@joy-one-client/utils/location-query";
import { runWithDelay } from "@joy-one-client/utils/run-with-delay";
import { useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { api } from "../apis";
import QUERY_USER_WORKSPACE_MEMBERS from "../workspace-members/graphql/queryUserWorkspaceMembers.graphql";
import QUERY_WORKSPACE_SETTING from "../workspace-settings/graphql/queryWorkspaceSetting.graphql";
import { Context } from "./workspace-context";
import {
  WorkspaceContext,
  WorkspaceDto,
  WorkspaceEntity,
  WorkspaceMemberInvitationState,
} from "./workspaces-types";

const WorkspaceProvider: FC<PropsWithChildren> = (props) => {
  const client = useApolloClient();
  const auth = useAuth();
  const router = useRouter();
  const app = useApp();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isCreateNew, setIsCreateNew] = useState(false);
  const [invitationState, setInvitationState] = useState<WorkspaceMemberInvitationState>();
  const [workspaceId, setWorkspaceId] = useLocalStorage(StorageKey.WORKSPACE_ID);

  const [fetchWorkspaceMembers, { data: workspaceMembersData }] = useLazyQuery(
    QUERY_USER_WORKSPACE_MEMBERS,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
    }
  );

  const [fetchWorkspaceSetting, { data: workspaceSettingData }] = useLazyQuery(
    QUERY_WORKSPACE_SETTING,
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

  const select = async (workspaceId: string) => {
    startAppLoading("initial-workspace");
    setIsInitialized(true);
    client.cache.reset();
    await initialize(workspaceId);
  };

  const create = async (dto: WorkspaceDto) => {
    const workspace = await api.post<WorkspaceEntity>("/workspaces", dto);
    const result = await fetchWorkspaceMembers();

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
    await fetchWorkspaceMembers();
    leave();
  };

  const join = async (code: string) => {
    const result = await joinWorkspaceMember(code);
    await initialize(result.workspaceId);
  };

  const leaveInvitation = () => {
    router.replace("/");
    setInvitationState(undefined);
  };

  const initialize = async (selectedWorkspaceId: string | null) => {
    try {
      await runWithDelay(async () => {
        const result = await fetchWorkspaceMembers();

        const workspaceMember = result.data?.userWorkspaceMembers.find(
          (member) =>
            member.workspaceId === selectedWorkspaceId ||
            member.workspaceId === app.metadata.workspaceId
        );

        if (selectedWorkspaceId && workspaceMember && workspaceMember.workspaceId) {
          setWorkspaceId(selectedWorkspaceId);
          await fetchWorkspaceSetting();
        } else {
          setWorkspaceId(undefined);
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsInitialized(true);
      endAppLoading("initial-workspace");
    }
  };

  useEventsListener(
    [
      EventType.WorkspaceUpdated,
      EventType.WorkspaceArchived,
      EventType.WorkspaceMemberLeaved,
      EventType.WorkspaceMemberUpdated,
      EventType.WorkspaceMemberTransferOwner,
      EventType.WorkspaceBranchNew,
      EventType.WorkspaceBranchUpdated,
      EventType.WorkspaceRolesNew,
      EventType.WorkspaceRolesUpdated,
      EventType.WorkspaceRolesRemoved,
      EventType.WorkspaceInviteCodeUpdated,
      EventType.WorkspaceMemberTransferOwner,
      EventType.WorkspaceBranchNew,
      EventType.WorkspaceMemberSynced,
    ],
    () => fetchWorkspaceMembers()
  );

  useEventsListener([EventType.WorkspaceSettingUpdated], () => fetchWorkspaceSetting());

  useEffect(() => {
    if (!member) return;

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
  }, [member]);

  useEffect(() => {
    if (auth.isInitialized) {
      if (auth.user?._id) {
        const currentWorkspaceId = getLocalStorage(StorageKey.WORKSPACE_ID);
        initialize(currentWorkspaceId);
      } else {
        setWorkspaceId(undefined);
        setIsInitialized(false);
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
    hasPermission: (permission: WorkspacePermission) =>
      member?.permissions.includes(permission) ?? false,
    isInitialized,
    member: member!,
    userMembers: workspaceMembersData?.userWorkspaceMembers ?? [],
    select,
    create,
    leave,
    invitationState,
    leaveInvitation,
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
    isAvailable: isInitialized && !!auth.user && !!member && !!workspaceSettingData,
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
