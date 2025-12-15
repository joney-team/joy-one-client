"use client";

import { Button } from "@/components/buttons/button";
import { searchArray } from "@/modules/search/search-service";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceRoleEntity } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { Checkbox, Combobox, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Circle } from "../../../components/circle";
import { Selector, SelectorContext } from "../../../components/selector";

type WorkspaceRoleOption = Pick<WorkspaceRoleEntity, "_id" | "name" | "color">;

interface WorkspaceRolesSelectorProps {
  onSelect: (role: WorkspaceRoleOption) => void;
  disabled?: boolean;
  selectedIds?: string[];
  target?: (ctx: SelectorContext<WorkspaceRoleOption>) => ReactNode;
}

export const WorkspaceRolesSelector: FC<WorkspaceRolesSelectorProps> = (props) => {
  const workspace = useWorkspace();
  const options: WorkspaceRoleOption[] = workspace.roles.map((v) => ({ ...v, name: v.name }));
  const color = useColor();

  return (
    <Selector<WorkspaceRoleOption>
      disabled={props.disabled}
      autoCloseOnChange={false}
      staticSearch
      pinnedOptions={options}
      renderOption={(mo) => {
        const _color = color(mo.color || "gray");
        return (
          <Combobox.Option value={mo._id} key={mo._id}>
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
      onSelect={(e) => {
        if (!e) return;
        props.onSelect?.(e);
      }}
      onSearch={(q) => searchArray<WorkspaceRoleOption>(options, ["name"], q)}
    />
  );
};
