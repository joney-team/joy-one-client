import { Button } from "@/components/buttons/button";
import { t } from "@/modules/lang/lang-service";
import { searchArray } from "@/modules/search/search-service";
import { WorkspaceRoleEntity } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Checkbox, em, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext } from "./selector";
import { useColor } from "@/modules/theme/use-color";
import { Circle } from "../circle";

type WorkspaceRoleOption = Pick<WorkspaceRoleEntity, "_id" | "name" | "color">;

interface WorkspaceRolesSelectorProps {
  onSelect: (role: WorkspaceRoleOption) => void;
  disabled?: boolean;
  selectedIds?: string[];
  renderTrigger?: (ctx: SelectorContext<WorkspaceRoleOption>) => ReactNode;
}

export const WorkspaceRolesSelector: FC<WorkspaceRolesSelectorProps> = (props) => {
  const workspace = useWorkspace();
  const options: WorkspaceRoleOption[] = workspace.roles.map((v) => ({ ...v, name: t(v.name) }));
  const color = useColor();

  return (
    <Selector
      disabled={props.disabled}
      autoCloseOnChange={false}
      staticSearch
      onInitOptions={() => options}
      searchPlaceholder={`${t("search_with", { query: ["name"].map((v) => t(v).toLowerCase()).join(", ") })}`}
      renderOptionChild={(mo) => {
        const _color = color(mo.color || "gray");
        return (
          <Group gap={10} onClick={() => props.onSelect?.(mo)}>
            <Group gap={8} flex={1}>
              <Circle size={12} color={_color} />

              <Text>{mo.name}</Text>
            </Group>

            <Checkbox
              checked={props.selectedIds?.includes(mo._id)}
              onChange={() => props.onSelect?.(mo)}
              radius={5}
              size="xs"
            />
          </Group>
        );
      }}
      renderTarget={(ctx) => {
        const { toggle } = ctx;
        if (props.renderTrigger) return props.renderTrigger(ctx);

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
      onSelect={(e) => {
        if (!e) return;
        props.onSelect?.(e);
      }}
      onSearch={(q) => searchArray<WorkspaceRoleOption>(options, ["name"], q)}
    />
  );
};
