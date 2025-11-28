"use client";

import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Menu, Text } from "@mantine/core";
import { IconArrowDown, IconArrowsDownUp, IconArrowUp } from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { ActionButton } from "../components/action-button";
import { useListContext } from "../list-context";
import { getColumnLabel, getSortQueryKey } from "../list-utils";

export const Sort: FC = () => {
  const { columns, list } = useListContext();
  const color = useColor();
  const layout = useLayout();

  if (columns.every((col) => !col.sortable)) return null;

  const sorting = columns.filter((column) => list.params[getSortQueryKey(column.columnKey)]);

  const onReset = () => {
    list.removeParams(sorting.map((column) => getSortQueryKey(column.columnKey)));
  };

  return (
    <Menu>
      <Menu.Target>
        <Group>
          <ActionButton
            icon={IconArrowsDownUp}
            label={layout.view === "mobile" ? null : <Trans>Sort</Trans>}
            quantity={sorting.length}
            onClear={sorting.length > 0 ? onReset : undefined}
            active={sorting.length > 0}
          />
        </Group>
      </Menu.Target>

      <Menu.Dropdown>
        {columns.map((column) => {
          if (!column || !column.sortable) return null;

          const queryKey = getSortQueryKey(column.columnKey);
          const querySort = list.params[queryKey];

          const isAsc = querySort === "1";
          const isDesc = querySort === "-1";

          return (
            <Fragment key={column.columnKey}>
              <Group justify="space-between" gap={8} py={8} px={4}>
                <Text flex={1} pl={4} fz={14}>
                  {getColumnLabel(column.columnKey, column)}
                </Text>

                <Group gap={2}>
                  <ActionIcon
                    variant={isAsc ? "light" : "subtle"}
                    color={color(isAsc ? "primary" : "dark")}
                    onClick={() => {
                      if (isAsc) return list.removeParams([queryKey]);
                      return list.setParams({ [queryKey]: "1" });
                    }}
                  >
                    <IconArrowUp size={16} />
                  </ActionIcon>

                  <ActionIcon
                    variant={isDesc ? "light" : "subtle"}
                    color={color(isDesc ? "primary" : "dark")}
                    onClick={() => {
                      if (isDesc) return list.removeParams([queryKey]);
                      return list.setParams({ [queryKey]: "-1" });
                    }}
                  >
                    <IconArrowDown size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Fragment>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};
