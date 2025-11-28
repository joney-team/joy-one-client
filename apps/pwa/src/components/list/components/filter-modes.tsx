"use client";

import { useLayout } from "@/layout/layout-context";
import { Trans } from "@lingui/react/macro";
import { Divider, Group, Popover, Stack } from "@mantine/core";
import { IconEyeCog, IconLayoutGrid, IconTable } from "@tabler/icons-react";
import { FC } from "react";
import { useListContext } from "../list-context";
import { ActionButton } from "./action-button";

export const ListFilterModes: FC = () => {
  const context = useListContext();
  const layout = useLayout();
  const filterModes = (context.filterModes || []).filter((mode) => !mode.disabled);

  if (filterModes.length === 0) return null;

  if (layout.view === "mobile") {
    return (
      <Popover offset={5}>
        <Popover.Target>
          <Group>
            <ActionButton icon={IconEyeCog} active={!!context.viewState.activatedModes?.length} />
          </Group>
        </Popover.Target>

        <Popover.Dropdown
          style={{
            padding: 10,
          }}
        >
          <Stack gap={10}>
            {filterModes.map((mode, i) => {
              const isActive = !!context.viewState.activatedModes?.includes(mode.param);
              const { icon, name } = mode;

              return (
                <ActionButton
                  key={i}
                  icon={icon}
                  label={name}
                  active={isActive}
                  onClick={() => context.toggleActivatedMode(mode.param)}
                />
              );
            })}

            <Divider label={<Trans>View</Trans>} />

            <Group gap={10}>
              <ActionButton
                icon={IconTable}
                label={<Trans>Table</Trans>}
                active={context.viewState.view === "table"}
                onClick={() =>
                  context.setViewState({
                    ...context.viewState,
                    view: context.viewState.view === "table" ? "grid" : "table",
                  })
                }
              />

              <ActionButton
                icon={IconLayoutGrid}
                label={<Trans>Grid</Trans>}
                active={context.viewState.view === "grid"}
                onClick={() =>
                  context.setViewState({
                    ...context.viewState,
                    view: context.viewState.view === "grid" ? "table" : "grid",
                  })
                }
              />
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    );
  }

  return filterModes.map((mode, i) => {
    const isActive = !!context.viewState.activatedModes?.includes(mode.param);
    const { icon, name } = mode;

    return (
      <ActionButton
        key={i}
        icon={icon}
        label={name}
        active={isActive}
        onClick={() => context.toggleActivatedMode(mode.param)}
      />
    );
  });
};
