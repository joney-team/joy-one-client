"use client";

import { useApolloClient } from "@apollo/client/react";
import { useForceUpdate } from "@mantine/hooks";
import { useEffect, useMemo, useRef } from "react";
import { WorkspaceMemberDataFragment } from "./graphql/fragmentWorkspaceMember.graphql";
import QUERY_WORKSPACE_MEMBERS_BY_IDS from "./graphql/queryWorkspaceMembersByIds.graphql";

export const useWorkspaceMembers = (
  userIds?: string[]
): [WorkspaceMemberDataFragment[], boolean, (user: WorkspaceMemberDataFragment) => void] => {
  const client = useApolloClient();

  const _userIds = userIds || [];
  const workspaceMembers = useRef<WorkspaceMemberDataFragment[]>([]);
  const isInitialized = useRef(false);
  const forceUpdate = useForceUpdate();

  const missingIds = useMemo(
    () => [
      ...new Set(
        _userIds.filter(
          (id) => !workspaceMembers.current.find((assignee) => assignee.userId === id)
        )
      ),
    ],
    [JSON.stringify(_userIds)]
  );

  useEffect(() => {
    client
      .query({
        query: QUERY_WORKSPACE_MEMBERS_BY_IDS,
        variables: {
          ids: missingIds,
        },
      })
      .then((data) => {
        workspaceMembers.current = [
          ...workspaceMembers.current.filter((assignee) => !missingIds.includes(assignee.userId)),
          ...(data.data?.workspaceMembersByIds ?? []),
        ];
      })
      .catch((error) => {
        console.trace(missingIds, error);
        return [];
      })
      .finally(() => {
        isInitialized.current = true;
        forceUpdate();
      });
  }, [JSON.stringify(missingIds)]);

  return [
    workspaceMembers.current,
    isInitialized.current,
    (user: WorkspaceMemberDataFragment) => {
      workspaceMembers.current = [
        ...workspaceMembers.current.filter((assignee) => assignee.userId !== user.userId),
        user,
      ];
      forceUpdate();
    },
  ];
};
