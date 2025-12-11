"use client";

import { DynamicSelectorFilterOption } from "@/components/list/filters/dynamic-selector-filter";
import { Column } from "@/components/list/types";
import { AppEntity } from "@/types";
import { t } from "@lingui/core/macro";
import { IconBuildingSkyscraper } from "@tabler/icons-react";
import { searchEntity } from "../search/search-service";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { useWorkspace } from "../workspaces/workspace-context";
import { getWorkspaceBranchByIds } from "./workspace-branches-service";
import { Trans } from "@lingui/react/macro";

export const workspaceBranchColumn = (): Column => {
  const workspace = useWorkspace();
  const rootOption = { label: t`Main office`, value: "root", data: null };

  const bindOptions = (options: DynamicSelectorFilterOption[]) => {
    return [...options.map((v) => ({ label: v.label, value: v.value, data: v.data })), rootOption];
  };

  return {
    defaultWidth: 150,
    icon: IconBuildingSkyscraper,
    name: <Trans>Branch</Trans>,
    render: ({ data }) => {
      return data.workspaceBranch ? data.workspaceBranch.name : t`Main office`;
    },
    exportToExcel: (_, loan) => {
      if (!loan.workspaceBranch)
        return {
          text: t`Main office`,
        };
      return {
        text: loan.workspaceBranch.name,
      };
    },
    disabled: !workspace.isShouldEnableBranches,
    filter:
      workspace.userMember.workspace.branches > 0 &&
      workspace.hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS)
        ? {
            dynamicSelector: {
              pinnedOptions: [rootOption],
              getOptions: async (ids) => {
                const options = await getWorkspaceBranchByIds(ids.filter((v) => v !== "root"));
                return bindOptions(options.map((v) => ({ label: v.name, value: v._id, data: v })));
              },
              search: async (q) => {
                const options = await searchEntity(AppEntity.WORKSPACE_BRANCHES, q);
                return bindOptions(options.map((v) => ({ label: v.name, value: v._id, data: v })));
              },
              listRoute: "/workspace-branches",
            },
          }
        : workspace.userMember.workspaceBranches.length > 1
        ? {
            staticSelector: {
              options: workspace.userMember.workspaceBranches.map((v) => ({
                label: v.name,
                value: v._id,
              })),
            },
          }
        : undefined,
  };
};
