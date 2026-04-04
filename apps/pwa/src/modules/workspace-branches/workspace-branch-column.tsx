"use client";

import { DynamicSelectorFilterOption } from "@/components/list/filters/dynamic-selector-filter";
import { Column } from "@/components/list/types";
import { AppEntity } from "@/types";
import { Trans, useLingui } from "@lingui/react/macro";
import { IconBuildingSkyscraper } from "@tabler/icons-react";
import { searchEntity } from "../search/search-service";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { useWorkspace } from "../workspaces/workspace-context";
import GetWorkspaceBranchesDocument from "./graphql/getWorkspaceBranches.graphql";
import GetWorkspaceBranchesByIdsDocument from "./graphql/getWorkspaceBranchesByIds.graphql";

export const workspaceBranchColumn = (): Column => {
  const workspace = useWorkspace();
  const { t } = useLingui();
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
    exportToExcel: (_, data) => {
      if (!data.workspaceBranch) {
        return {
          text: t`Main office`,
        };
      }

      return {
        text: data.workspaceBranch.name,
      };
    },
    disabled: !workspace.isShouldEnableBranches,
    filter:
      workspace.member.workspaceBranches.length > 0 ||
      workspace.hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS)
        ? {
            dynamicSelector: {
              pinnedOptions: [rootOption],
              getSelectedOptions: async (ids, client) => {
                const results = await client.query({
                  query: GetWorkspaceBranchesByIdsDocument,
                  variables: { ids: ids.filter((v) => v !== "root") },
                });
                const options = results.data?.branches ?? [];
                return bindOptions(options.map((v) => ({ label: v.name, value: v._id, data: v })));
              },
              search: async (q) => {
                const options = await searchEntity(AppEntity.WORKSPACE_BRANCHES, q);
                return bindOptions(options.map((v) => ({ label: v.name, value: v._id, data: v })));
              },
              listQuery: GetWorkspaceBranchesDocument,
            },
          }
        : workspace.member.workspaceBranches.length > 1
          ? {
              staticSelector: {
                options: workspace.member.workspaceBranches.map((v) => ({
                  label: v.name,
                  value: v._id,
                })),
              },
            }
          : undefined,
  };
};
