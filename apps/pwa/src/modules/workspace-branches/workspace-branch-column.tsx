import { Column } from "@/components/list/types";
import { ActionIcon, Group, Text } from "@mantine/core";
import { IconBuildingSkyscraper, IconFileExport } from "@tabler/icons-react";
import { useWorkspace } from "../workspaces/workspace-context";
import { DynamicSelectorFilterOption } from "@/components/list/filters/dynamic-selector-filter";
import { t } from "../lang/lang-service";
import { Hovered } from "@/components/hovered";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { getWorkspaceBranchByIds, getWorkspaceBranches } from "./workspace-branches-service";
import { searchEntity } from "../search/search-service";
import { AppEntity } from "@/types";

export const WorkspaceBranchColumn = (args?: { onChange?: (data: any) => void; w?: number }): Column => {
  const workspace = useWorkspace();

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
      return (
        <Hovered disabled={!args?.onChange}>
          {(hover) => {
            return (
              <Group
                ref={hover.ref}
                gap={5}
                onClick={() => {
                  if (!args?.onChange) return;
                  args.onChange(data);
                }}
              >
                <Text>{data.workspaceBranch ? data.workspaceBranch.name : t("main_workspace_branch")}</Text>
                <ActionIcon variant="subtle" color="gray" opacity={hover.hovered ? 1 : 0}>
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
    disabled: !workspace.isShowBranches,
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
              getInitialOptions: async () => {
                const options = await getWorkspaceBranches({ limit: 5 });
                return bindOptions(options.data.map((v) => ({ label: v.name, value: v._id, data: v })));
              },
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
