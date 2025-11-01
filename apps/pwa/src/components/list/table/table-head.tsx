"use client";

import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Box, Group, Stack, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconSelector } from "@tabler/icons-react";
import { FC, useEffect, useRef } from "react";
import { TableColumn } from "../types";
import { getSortQueryKey, getValuePath } from "../utils";
import { useColumnResize } from "./use-collumn-resize";

import { classNames } from "@/utils/ui.utils";
import { useListContext } from "../list-context";
import styles from "./table-head.module.css";

export const ListTableHead: FC<{ column: TableColumn }> = ({ column }) => {
  const { list, changeColumnState } = useListContext();
  const hover = useHover();
  const sortIconRef = useRef<any>(null);
  const color = useColor();

  const resize = useColumnResize({
    columnKey: column.columnKey,
    minWidth: column.minWidth,
    initialWidth: column.width,
    disabled: !column.resizable,
    onResize: (columnKey, width) => {
      changeColumnState(columnKey, { width });
    },
  });

  const sortKey = getSortQueryKey(column.columnKey);
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

  const { sortable } = column;
  const columnName = column?.name || getValuePath(column.columnKey, column);

  return (
    <th
      className={classNames(styles.TableHead, "unselectable")}
      ref={hover.ref}
      data-column-key={column.columnKey}
      onClick={sortable ? onSort : undefined}
      style={{
        width: column.width,
        cursor: resize.isResizing ? "col-resize" : sortable ? "pointer" : "default",
        backgroundColor: sortable
          ? hover.hovered
            ? "var(--mantine-color-default-hover)"
            : "transparent"
          : "transparent",
        position: "relative",
        overflow: "visible",
      }}
    >
      <Group gap={4} flex={1} justify={column.align} align="center" w="100%" wrap="nowrap">
        {column?.icon && typeof column.icon !== "boolean" && (
          <Group style={{ width: 16, height: 16 }} justify="center" align="center">
            <column.icon size={16} />
          </Group>
        )}

        <Text truncate fz={13} fw={500} ta={column.align ?? "left"} title={columnName}>
          {columnName}
        </Text>

        {column.sortable && (
          <ActionIcon variant="subtle" color="var(--mantine-color-dimmed)" size="sm">
            <IconSelector size={16} ref={sortIconRef} />
          </ActionIcon>
        )}
      </Group>

      <Stack
        className={styles.ResizeHandle}
        pos="absolute"
        top={0}
        justify="center"
        align="center"
        bottom={0}
        w={6}
        bg="transparent"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={resize.handleMouseDown}
        style={{
          left: (resize.currentWidth || 0) - 3,
          zIndex: 2,
          cursor: column.resizable ? "col-resize" : "default",
        }}
      >
        <Box
          w={2}
          h="50%"
          bg={color({ light: "gray.3", dark: "gray.7" })}
          style={{ borderRadius: 15 }}
        />
      </Stack>
    </th>
  );
};
