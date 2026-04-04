"use client";

import { useApolloClient } from "@apollo/client/react";
import { useForceUpdate } from "@mantine/hooks";
import { useEffect, useMemo, useRef } from "react";
import { WorkspaceMemberFragment } from "./graphql/fragmentWorkspaceMember.graphql";
import GetWorkspaceMembersByIdsDocument from "./graphql/getWorkspaceMembersByIds.graphql";

export const useWorkspaceMembers = (
  userIds?: string[],
): [WorkspaceMemberFragment[], boolean, (user: WorkspaceMemberFragment) => void] => {
  const client = useApolloClient();

  const _userIds = userIds || [];
  const workspaceMembers = useRef<WorkspaceMemberFragment[]>([]);
  const isInitialized = useRef(false);
  const forceUpdate = useForceUpdate();

  const missingIds = useMemo(
    () => [
      ...new Set(
        _userIds.filter(
          (id) => !workspaceMembers.current.find((assignee) => assignee.userId === id),
        ),
      ),
    ],
    [JSON.stringify(_userIds)],
  );

  useEffect(() => {
    client
      .query({
        query: GetWorkspaceMembersByIdsDocument,
        variables: {
          ids: missingIds,
        },
      })
      .then((data) => {
        workspaceMembers.current = [
          ...workspaceMembers.current.filter((assignee) => !missingIds.includes(assignee.userId)),
          ...(data.data?.members ?? []),
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
    (user: WorkspaceMemberFragment) => {
      workspaceMembers.current = [
        ...workspaceMembers.current.filter((assignee) => assignee.userId !== user.userId),
        user,
      ];
      forceUpdate();
    },
  ];
};
