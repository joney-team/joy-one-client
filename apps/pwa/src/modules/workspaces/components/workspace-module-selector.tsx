"use client";

import { Button } from "@/components/buttons/button";
import { SelectOption, Selector, SelectorContext } from "@/components/selector";
import { searchArray } from "@/modules/search/search-service";
import {
  useAvailableWorkspaceModules,
  WorkspaceModule,
} from "@/modules/workspaces/workspace-modules";
import { Trans } from "@lingui/react/macro";
import { Combobox, Group, Text, ThemeIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";

type WorkspaceModuleOption = WorkspaceModule & SelectOption & { plainName: string };

interface WorkspaceModuleSelectorProps {
  restrictDisplay?: ("navigation" | "spotlight")[];
  onSelect: (value: WorkspaceModuleOption) => void;
  excludeIds?: string[];
  target?: (ctx: SelectorContext<WorkspaceModuleOption>) => ReactNode;
}

export const WorkspaceModuleSelector: FC<WorkspaceModuleSelectorProps> = (props) => {
  const { availableModules } = useAvailableWorkspaceModules();
  const options: WorkspaceModuleOption[] = availableModules
    .map((v) => ({ ...v, plainName: v.name }))
    .filter(
      (v) =>
        !props.excludeIds?.includes(v.id) &&
        (!props.restrictDisplay ||
          !v.restrictDisplay ||
          props.restrictDisplay.includes(v.restrictDisplay as any))
    );

  return (
    <Selector<WorkspaceModuleOption>
      autoCloseOnChange={false}
      excludeIds={props.excludeIds}
      pinnedOptions={options}
      renderOption={(mo) => {
        return (
          <Combobox.Option value={mo.id} key={mo.id}>
            <Group gap={10} py={8}>
              <ThemeIcon color="dark" variant="transparent">
                <mo.icon strokeWidth={1.5} size={26} />
              </ThemeIcon>

              <Text>{mo.name}</Text>
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
        props.onSelect(e);
      }}
      onSearch={(q) => searchArray<WorkspaceModuleOption>(options, ["plainName"], q)}
    />
  );
};
