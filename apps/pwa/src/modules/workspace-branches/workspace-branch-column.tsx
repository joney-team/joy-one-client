"use client";

import { Hovered } from "@/components/hovered";
import { DynamicSelectorFilterOption } from "@/components/list/filters/dynamic-selector-filter";
import { Column } from "@/components/list/types";
import { AppEntity } from "@/types";
import { ActionIcon, Group, Text } from "@mantine/core";
import { IconBuildingSkyscraper, IconFileExport } from "@tabler/icons-react";
import { t } from "../lang/lang-service";
import { searchEntity } from "../search/search-service";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { useWorkspace } from "../workspaces/workspace-context";
import { getWorkspaceBranchByIds } from "./workspace-branches-service";
import {
  OnModalUpdateWorkspaceBranch,
  permissionRequireds,
} from "./modals/modal-update-workspace-branch";

type WorkspaceBranchColumnData = any;

interface WorkspaceBranchColumnProps {
  w?: number;
  entity: AppEntity;
}

export const WorkspaceBranchColumn = (
  args: WorkspaceBranchColumnProps
): Column<WorkspaceBranchColumnData, any> => {
  const workspace = useWorkspace();
  const permissionRequired = permissionRequireds[args.entity];
  const isEditable = permissionRequired && workspace.hasPermission(permissionRequired);

  const bindOptions = (options: DynamicSelectorFilterOption[]) => {
    return [
      ...options.map((v) => ({ label: v.label, value: v.value, data: v.data })),
      { label: t("main_workspace_branch"), value: "root", data: null },
    ];
  };

  return {
    w: args?.w,
    icon: IconBuildingSkyscraper,
    name: "branch",
    render: ({ data }) => {
      const id = data.id || data._id;
      return (
        <Hovered disabled={!isEditable}>
          {(hover) => {
            return (
              <Group ref={hover.ref} gap={5}>
                <Text>
                  {data.workspaceBranch ? data.workspaceBranch.name : t("main_workspace_branch")}
                </Text>

                <ActionIcon
                  variant="subtle"
                  color="gray"
                  opacity={hover.hovered ? 1 : 0}
                  onClick={() => {
                    OnModalUpdateWorkspaceBranch({
                      entity: args.entity,
                      ids: [id],
                    });
                  }}
                >
                  <IconFileExport size={16} />
                </ActionIcon>
              </Group>
            );
          }}
        </Hovered>
      );
    },
    exportToExcel: ({ data }) => {
      if (!data.workspaceBranch) return t("main_workspace_branch");
      return data.workspaceBranch.name;
    },
    disabled: !workspace.isShouldEnableBranches,
    filter:
      workspace.userMember.workspace.branches > 0 &&
      workspace.hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS)
        ? {
            dynamicSelector: {
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
