"use client";

import { Button } from "@/components/buttons/button";
import { t } from "@/modules/lang/lang-service";
import { searchArray, searchEntity } from "@/modules/search/search-service";
import { WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { Combobox, em, Group, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { Selector, SelectorProps } from "../../components/selector";

type WorkspaceBranchOption = Pick<WorkspaceBranchEntity, "_id" | "name" | "hotline">;

interface WorkspaceBranchSelectorProps extends Partial<SelectorProps<WorkspaceBranchOption>> {
  isShowRoot?: boolean;
}

export const WorkspaceBranchSelector: FC<WorkspaceBranchSelectorProps> = (props) => {
  const workspace = useWorkspace();
  const isFullAccess = workspace.userMember.permissions.includes(
    WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS
  );

  const listRoute = isFullAccess ? "/workspace-branches" : undefined;
  const rootOption = {
    _id: "root",
    name: t("main_workspace_branch"),
  };

  return (
    <Selector<WorkspaceBranchOption>
      {...props}
      staticSearch={!isFullAccess}
      onSearch={(q) => {
        if (isFullAccess) {
          return searchEntity(AppEntity.WORKSPACE_BRANCHES, q);
        }

        return searchArray(workspace.userMember.workspaceBranches, ["name"], q);
      }}
      listRoute={listRoute}
      pinnedOptions={
        isFullAccess
          ? props.isShowRoot
            ? [rootOption]
            : undefined
          : workspace.userMember.workspaceBranches
      }
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
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
            fz={em(14)}
            fw={500}
            onClick={toggle}
          >
            {t("select")}
          </Button>
        );
      }}
    />
  );
};
