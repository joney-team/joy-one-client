import { useEffect, useMemo, useRef } from "react";
import { useForceUpdate } from "@mantine/hooks";
import { getWorkspaceMemberByIds } from "./workspace-members-service";
import { WorkspaceMember } from "./workspace-members-types";

export const useWorkspaceMembers = (userIds?: string[]): [WorkspaceMember[], boolean, (user: WorkspaceMember) => void] => {
  const _userIds = userIds || [];
  const workspaceMembers = useRef<WorkspaceMember[]>([]);
  const isInitialized = useRef(false);
  const forceUpdate = useForceUpdate();

  const missingIds = useMemo(() => [...new Set(_userIds.filter(id => !workspaceMembers.current.find(assignee => assignee.userId === id)))], [JSON.stringify(_userIds)]);

  useEffect(() => {
    getWorkspaceMemberByIds(missingIds)
      .then(data => {
        workspaceMembers.current = [...workspaceMembers.current.filter(assignee => !missingIds.includes(assignee.userId)), ...data];
      })
      .catch((error) => {
        console.trace(missingIds, error);
        return [];
      })
      .finally(() => {
        isInitialized.current = true;
        forceUpdate();
      });
  }, [JSON.stringify(missingIds)])

  return [
    workspaceMembers.current,
    isInitialized.current,
    (user: WorkspaceMember) => {
      workspaceMembers.current = [...workspaceMembers.current.filter(assignee => assignee.userId !== user.userId), user];
      forceUpdate();
    }
  ];
}