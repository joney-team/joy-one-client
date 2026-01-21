"use client";

import { useForceUpdate } from "@mantine/hooks";
import { useEffect, useMemo, useRef } from "react";
import { WorkspaceMemberDataFragment } from "./graphql/fragmentWorkspaceMember.graphql";
import { getWorkspaceMemberByIds } from "./workspace-members-service";

export const useWorkspaceMembers = (
  userIds?: string[]
): [WorkspaceMemberDataFragment[], boolean, (user: WorkspaceMemberDataFragment) => void] => {
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
    getWorkspaceMemberByIds(missingIds)
      .then((data) => {
        workspaceMembers.current = [
          ...workspaceMembers.current.filter((assignee) => !missingIds.includes(assignee.userId)),
          ...data,
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
