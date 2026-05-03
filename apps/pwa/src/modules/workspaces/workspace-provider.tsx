"use client";

import { useApp } from "@/app.context";
import { endAppLoading, startAppLoading } from "@/components/app-loading/app-loading";
import { StorageKey } from "@/constants/storage-key";
import { EventType } from "@/graphql/enums.graphql";
import { CreateWorkspaceInput } from "@/graphql/types.graphql";
import { emitInternalEvent, InternalEvent } from "@/hooks/use-internal-event";
import { getLocalStorage, useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/modules/auth/auth-context";
import { useEventsListener } from "@/modules/events/event-service";
import { JoinWorkspaceWithInviteCodeDocument } from "@/modules/workspace-members/graphql/joinWorkspaceWithInviteCode.graphql";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useApolloClient, useLazyQuery, useMutation } from "@apollo/client/react";
import { removeParams } from "@joy-one-client/utils/location-query";
import { runWithDelay } from "@joy-one-client/utils/run-with-delay";
import { useRouter } from "next/navigation";
import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import GetUserWorkspaceMembersDocument from "../workspace-members/graphql/getUserWorkspaceMembers.graphql";
import GetWorkspaceMemberByUserIdDocument from "../workspace-members/graphql/getWorkspaceMemberByUserId.graphql";
import { isMemberHasPermission } from "../workspace-roles/workspace-role-utils";
import GetWorkspaceSettingDocument from "../workspace-settings/graphql/getWorkspaceSetting.graphql";
import ArchiveWorkspaceDocument from "./graphql/archiveWorkspace.graphql";
import CreateWorkspaceDocument from "./graphql/createWorkspace.graphql";
import { Context } from "./workspace-context";
import { WorkspaceContext } from "./workspaces-types";

const WorkspaceProvider: FC<PropsWithChildren> = (props) => {
  const client = useApolloClient();
  const auth = useAuth();
  const router = useRouter();
  const app = useApp();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isCreateNew, setIsCreateNew] = useState(false);
  const [workspaceId, setWorkspaceId] = useLocalStorage(StorageKey.WORKSPACE_ID);

  const [fetchWorkspaceMembers, { data: workspaceMembersData }] = useLazyQuery(
    GetUserWorkspaceMembersDocument,
    {
      fetchPolicy: "network-only",
    },
  );

  const [fetchWorkspaceSetting, { data: workspaceSettingData, refetch: refetchWorkspaceSetting }] =
    useLazyQuery(GetWorkspaceSettingDocument, {
      fetchPolicy: "cache-and-network",
    });

  const member = useMemo(
    () =>
      auth.user
        ? workspaceMembersData?.members.find((w) => w.workspaceId === workspaceId)
        : undefined,
    [workspaceMembersData, workspaceId],
  );

  const select = async (workspaceId: string) => {
    startAppLoading("initial-workspace");
    setIsInitialized(true);
    client.cache.reset();
    const success = await initialize(workspaceId);
    if (success) {
      emitInternalEvent(InternalEvent.WORKSPACE_CHANGED, workspaceId);
    }
  };

  const create = async (input: CreateWorkspaceInput) => {
    const workspace = await client.mutate({
      mutation: CreateWorkspaceDocument,
      variables: { input },
    });
    const result = await fetchWorkspaceMembers();

    const userWorkspace = result.data?.members.find(
      (userWorkspaceMember) => userWorkspaceMember.workspaceId === workspace.data?.workspace._id,
    );

    if (userWorkspace) select(userWorkspace.workspaceId);
  };

  const leave = () => {
    setWorkspaceId(undefined);
    router.replace(`/`);
  };

  const archive = async () => {
    await client.mutate({ mutation: ArchiveWorkspaceDocument });
    await fetchWorkspaceMembers();
    leave();
  };

  const [joinWorkspaceWithInviteCode] = useMutation(JoinWorkspaceWithInviteCodeDocument);
  const join = async (code: string) => {
    const result = await joinWorkspaceWithInviteCode({
      variables: { inviteCode: code },
    });
    await initialize(result.data?.joinWorkspaceWithInviteCode || "");
  };

  const leaveInvitation = () => {
    router.replace("/");
  };

  const initialize = async (selectedWorkspaceId: string | null) => {
    let isJoined = false;

    try {
      await runWithDelay(async () => {
        const result = await fetchWorkspaceMembers();

        const workspaceMember = result.data?.members.find(
          (member) =>
            member.workspaceId === selectedWorkspaceId ||
            member.workspaceId === app.metadata.workspaceId,
        );

        if (selectedWorkspaceId && workspaceMember && workspaceMember.workspaceId) {
          setWorkspaceId(selectedWorkspaceId);
          await fetchWorkspaceSetting();
          isJoined = true;
        } else {
          setWorkspaceId(undefined);
        }
      });
    } catch (error) {
      console.warn(`Error when initializing workspace`, error);
    } finally {
      setIsInitialized(true);
      endAppLoading("initial-workspace");
    }

    return isJoined;
  };

  useEventsListener(
    [EventType.WorkspaceMemberSynced, EventType.WorkspaceMemberLeaved, EventType.WorkspaceArchived],
    (e) => {
      if (
        (e.type === EventType.WorkspaceMemberLeaved && e.ref === auth.user?._id) ||
        e.type === EventType.WorkspaceArchived
      ) {
        fetchWorkspaceMembers();
      }

      if (
        e.ref &&
        (
          [EventType.WorkspaceMemberSynced, EventType.WorkspaceMemberLeaved] as EventType[]
        ).includes(e.type)
      ) {
        client
          .query({
            query: GetWorkspaceMemberByUserIdDocument,
            variables: { userId: e.ref },
            fetchPolicy: "network-only",
          })
          .catch((error) => console.error("Failed to fetch workspace member for event: ", error));
      }
    },
  );

  useEventsListener([EventType.WorkspaceSettingUpdated], () => {
    refetchWorkspaceSetting();
  });

  useEffect(() => {
    if (!member) return;
    app.joinWorkspaceRoom(member.workspaceId);
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

  const hasPermission: WorkspaceContext["hasPermission"] = useCallback(
    (permission) => {
      if (!member) return false;
      return isMemberHasPermission({ member, permission });
    },
    [member],
  );

  const isShouldEnableBranches = useMemo(() => {
    return (
      !!member &&
      member.workspace.branches > 0 &&
      (member.workspaceBranches.length > 1 ||
        hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS))
    );
  }, [member, hasPermission]);

  const contextValue: WorkspaceContext = {
    type: member?.workspace?.type!,
    hasPermission,
    isInitialized,
    member: member!,
    userMembers: workspaceMembersData?.members ?? [],
    select,
    create,
    leave,
    leaveInvitation,
    isCreateNew,
    setIsCreateNew,
    archive,
    join,
    ref: `${member?.workspaceId || "WS"}`,
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
