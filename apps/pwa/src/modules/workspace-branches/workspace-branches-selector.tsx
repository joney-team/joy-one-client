import { AppEntity } from "@/types";
import { Button } from "@/components/buttons/button";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { getWorkspaceBranches } from "@/modules/workspace-branches/workspace-branches-service";
import { WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import { em, Group, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { Selector, SelectorProps } from "../../components/selector/selector";

type WorkspaceBranchOption = Pick<WorkspaceBranchEntity, "_id" | "name" | "hotline">;

interface WorkspaceBranchesSelectorProps extends SelectorProps<WorkspaceBranchOption> {}

export const WorkspaceBranchesSelector: FC<WorkspaceBranchesSelectorProps> = (props) => {
  return (
    <Selector
      {...props}
      onSearch={(q) => searchEntity(AppEntity.WORKSPACE_BRANCHES, q)}
      onInitOptions={() => getWorkspaceBranches({ limit: 5 }).then((res) => res.data)}
      searchPlaceholder={`${t("search_with", { query: ["name"].map((v) => t(v).toLowerCase()).join(", ") })}`}
      renderOptionChild={(item) => {
        return (
          <Group gap={8} justify="space-between">
            <Group gap={8}>
              <Stack gap={3}>
                <Text>{item.name}</Text>
              </Stack>
            </Group>
          </Group>
        );
      }}
      renderTarget={(ctx) => {
        const { toggle } = ctx;
        if (props.renderTarget) return props.renderTarget(ctx);
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
