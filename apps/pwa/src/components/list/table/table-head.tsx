"use client";

import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Checkbox, Group, Table, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconSelector } from "@tabler/icons-react";
import { FC, useEffect, useRef } from "react";
import { ListContext } from "../types";
import { getSortQueryKey, getValuePath } from "../utils";

export const ListTableHead: FC<ListContext & { columnId: string; colIndex: number }> = (ctx) => {
  const { columnId, colIndex, isShowMultipleSelectActions, list, selectedIds, columns } = ctx;
  const hover = useHover();
  const sortIconRef = useRef<any>(null);
  const color = useColor();
  const column = columns[columnId];

  const sortKey = getSortQueryKey(columnId);
  const sortValue = list.params[sortKey];
  const sortValueType = +sortValue === 1 ? "asc" : +sortValue === -1 ? "desc" : "none";

  const onSort = () => {
    if (!column?.sortable) return;

    if (sortValueType === "none") {
      return list.setParams({ [sortKey]: "-1" });
    }

    if (sortValueType === "desc") {
      return list.setParams({ [sortKey]: "1" });
    }

    if (sortValueType === "asc") {
      return list.removeParams([sortKey]);
    }
  };

  useEffect(() => {
    // Change color of sort icon
    if (sortIconRef.current) {
      const svg = sortIconRef.current as HTMLDivElement;
      const paths = svg.querySelectorAll("path");
      if (sortValueType === "asc") {
        paths[0].style.stroke = color("primary");
        paths[1].style.stroke = "currentColor";
      } else if (sortValueType === "desc") {
        paths[0].style.stroke = "currentColor";
        paths[1].style.stroke = color("primary");
      } else {
        paths[0].style.stroke = "currentColor";
        paths[1].style.stroke = "currentColor";
      }
    }
  }, [sortValueType]);

  if (!column) return null;

  const { sortable: sortable } = column;

  const isShowSelectAll = colIndex === 0 && isShowMultipleSelectActions;
  const isSelectedAll =
    list.data.length > 0 && list.data.every((v: any) => selectedIds.includes(v.id || v._id || ""));

  return (
    <Table.Th
      className="unselectable"
      ref={hover.ref}
      bg={
        sortable
          ? hover.hovered
            ? "var(--mantine-color-default-hover)"
            : "transparent"
          : "transparent"
      }
      style={{ cursor: sortable ? "pointer" : "default" }}
      onClick={sortable ? onSort : undefined}
      pl={isShowSelectAll ? 10 : undefined}
      w={column.w}
    >
      <Group wrap="nowrap" gap={8}>
        {isShowSelectAll && (
          <Checkbox
            size="xs"
            radius={5}
            checked={isSelectedAll}
            onChange={() => (isSelectedAll ? ctx.unselectAll() : ctx.selectAll())}
          />
        )}

        <Group justify={column.align} align="center" gap={5} c="var(--mantine-color-text)" flex={1}>
          {column?.icon && <column.icon size={16} />}

          <Text fz={13} fw={500} flex={1} ta={column.align} c="var(--mantine-color-text)">
            {column?.name || getValuePath(columnId, column)}
          </Text>

          {column.sortable && (
            <ActionIcon
              variant="subtle"
              color="var(--mantine-color-dimmed)"
              size="sm"
              mr={column.align === "right" ? -10 : 0}
            >
              <IconSelector size={16} ref={sortIconRef} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Table.Th>
  );
};
