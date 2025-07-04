"use client";

import { Button } from "@/components/buttons/button";
import { t } from "@/modules/lang/lang-service";
import { searchArray } from "@/modules/search/search-service";
import { WorkspaceModule } from "@/modules/workspaces/workspace-modules";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Combobox, em, Group, Text, ThemeIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { SelectOption, Selector, SelectorContext } from "@/components/selector";

type WorkspaceModuleOption = WorkspaceModule & SelectOption & { name: string };

interface WorkspaceModuleSelectorProps {
  restrictDisplay?: ("navigation" | "spotlight")[];
  onSelect: (value: WorkspaceModuleOption) => void;
  excludeIds?: string[];
  target?: (ctx: SelectorContext<WorkspaceModuleOption>) => ReactNode;
}

export const WorkspaceModuleSelector: FC<WorkspaceModuleSelectorProps> = (props) => {
  const workspace = useWorkspace();
  const options: WorkspaceModuleOption[] = workspace.availableModules
    .map((v) => ({ ...v, name: t(v.id) }))
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
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
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
        props.onSelect(e);
      }}
      onSearch={(q) => searchArray<WorkspaceModuleOption>(options, ["name"], q)}
    />
  );
};
