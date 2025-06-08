import { useEffect, useMemo, useRef } from "react";
import { useForceUpdate } from "@mantine/hooks";
import { WorkspaceBranchEntity } from "../workspace-branches-types";
import { getWorkspaceBranchByIds } from "../workspace-branches-service";

export const useWorkspaceBranches = (userIds?: string[]): [WorkspaceBranchEntity[], boolean, (branch: WorkspaceBranchEntity) => void] => {
  const _userIds = userIds || [];
  const workspaceBranches = useRef<WorkspaceBranchEntity[]>([]);
  const isInitialized = useRef(false);
  const forceUpdate = useForceUpdate();

  const missingIds = useMemo(() => [...new Set(_userIds.filter(id => !workspaceBranches.current.find(data => data._id === id)))], [JSON.stringify(_userIds)]);

  useEffect(() => {
    getWorkspaceBranchByIds(missingIds)
      .then(data => {
        workspaceBranches.current = [...workspaceBranches.current.filter(prevData => !missingIds.includes(prevData._id)), ...data];
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
    workspaceBranches.current,
    isInitialized.current,
    (branch: WorkspaceBranchEntity) => {
      workspaceBranches.current = [...workspaceBranches.current.filter(data => data._id !== branch._id), branch];
      forceUpdate();
    }
  ];
}