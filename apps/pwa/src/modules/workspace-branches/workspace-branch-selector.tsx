"use client";

import { Button } from "@/components/buttons/button";
import { searchArray, searchEntity } from "@/modules/search/search-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Combobox, Group, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { Selector, SelectorProps } from "../../components/selector";
import { WorkspaceBranchFragment } from "./graphql/fragmentWorkspaceBranch.graphql";
import GetWorkspaceBranchesDocument from "./graphql/getWorkspaceBranches.graphql";

type WorkspaceBranchOption = Pick<WorkspaceBranchFragment, "_id" | "name" | "hotline">;

interface WorkspaceBranchSelectorProps extends Partial<SelectorProps<WorkspaceBranchOption>> {
  isShowRoot?: boolean;
}

export const WorkspaceBranchSelector: FC<WorkspaceBranchSelectorProps> = ({
  isShowRoot,
  ...props
}) => {
  const workspace = useWorkspace();
  const isFullAccess = workspace.hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS);

  const rootOption = {
    _id: "root",
    name: t`Main office`,
    hotline: workspace.member.workspace.hotline,
  };

  return (
    <Selector<WorkspaceBranchOption>
      {...props}
      staticSearch={!isFullAccess}
      onSearch={async (q) => {
        if (isFullAccess) {
          const results = await searchEntity(AppEntity.WORKSPACE_BRANCHES, q);
          return results
            .filter((v) => v.__typename === "SearchResultWorkspaceBranch")
            .map((v) => ({
              _id: v.id,
              name: v.name,
              hotline: v.hotline,
            }));
        }

        return searchArray(workspace.member.workspaceBranches, ["name"], q);
      }}
      listQuery={isFullAccess ? GetWorkspaceBranchesDocument : undefined}
      pinnedOptions={
        isFullAccess ? (isShowRoot ? [rootOption] : undefined) : workspace.member.workspaceBranches
      }
      renderOption={(item) => {
        return (
          <Combobox.Option value={item._id} key={item._id}>
            <Group gap={8} justify="space-between">
              <Group gap={8}>
                <Stack gap={3}>
                  <Text>{item.name}</Text>
                </Stack>
              </Group>
            </Group>
          </Combobox.Option>
        );
      }}
      target={(ctx) => {
        const { toggle } = ctx;
        if (props.target) return props.target(ctx);
        return (
          <Button
            tt="capitalize"
            size="xs"
            variant="light"
            radius={100}
            leftIcon={IconPlus}
            onClick={toggle}
          >
            <Trans>Select</Trans>
          </Button>
        );
      }}
    />
  );
};
