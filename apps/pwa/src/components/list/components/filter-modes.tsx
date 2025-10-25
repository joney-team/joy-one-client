import { Divider, Group, Popover, Stack } from "@mantine/core";
import { IconEyeCog, IconLayoutGrid, IconTable } from "@tabler/icons-react";
import { FC } from "react";
import { ListContext } from "../types";
import { ActionButton } from "./action-button";
import { useLayout } from "@/layout/layout-context";
import { tl } from "@/modules/lang/lang-service";

export const ListFilterModes: FC<ListContext> = (ctx) => {
  const layout = useLayout();
  const filterModes = (ctx.filterModes || []).filter((mode) => !mode.disabled);

  if (filterModes.length === 0) return null;

  if (layout.view === "mobile") {
    return (
      <Popover offset={5}>
        <Popover.Target>
          <Group>
            <ActionButton icon={IconEyeCog} active={!!ctx.viewState.activatedModes?.length} />
          </Group>
        </Popover.Target>

        <Popover.Dropdown
          style={{
            padding: 10,
          }}
        >
          <Stack gap={10}>
            {filterModes.map((mode, i) => {
              const isActive = !!ctx.viewState.activatedModes?.includes(mode.param);
              const { icon, name } = mode;

              return (
                <ActionButton
                  key={i}
                  icon={icon}
                  label={name}
                  active={isActive}
                  onClick={() => ctx.toggleActivatedMode(mode.param)}
                />
              );
            })}

            <Divider label={tl("list_view_type")} />

            <Group gap={10}>
              <ActionButton
                icon={IconTable}
                label="table"
                active={ctx.viewState.view === "table"}
                onClick={() =>
                  ctx.setViewState({
                    ...ctx.viewState,
                    view: ctx.viewState.view === "table" ? "grid" : "table",
                  })
                }
              />

              <ActionButton
                icon={IconLayoutGrid}
                label="grid"
                active={ctx.viewState.view === "grid"}
                onClick={() =>
                  ctx.setViewState({
                    ...ctx.viewState,
                    view: ctx.viewState.view === "grid" ? "table" : "grid",
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
    const isActive = !!ctx.viewState.activatedModes?.includes(mode.param);
    const { icon, name } = mode;

    return (
      <ActionButton
        key={i}
        icon={icon}
        label={name}
        active={isActive}
        onClick={() => ctx.toggleActivatedMode(mode.param)}
      />
    );
  });
};
