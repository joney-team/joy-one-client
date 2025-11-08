"use client";

import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Box, Group, Stack, Text, Tooltip } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconMinus, IconSelector } from "@tabler/icons-react";
import { CSSProperties, FC, useEffect, useMemo, useRef } from "react";
import { TableColumn } from "../types";
import { getColumnName, getSortQueryKey, getValuePath } from "../utils";
import { useColumnResize } from "./use-collumn-resize";

import { classNames } from "@/utils/ui.utils";
import { Trans } from "@lingui/react/macro";
import { getFilterComponent } from "../filters";
import { FilterWrapper, FilterWrapperProps } from "../filters/types";
import { useListContext } from "../list-context";
import styles from "./table-head.module.css";

const TableHeadContent: FC<{
  column: TableColumn;
  filter?: FilterWrapperProps;
}> = ({ column, filter }) => {
  const { list } = useListContext();
  const sortIconRef = useRef<any>(null);
  const color = useColor();
  const context = useListContext();
  const columnName = column?.name || getValuePath(column.columnKey, column);

  const onClearFilter = () => {
    if (filter?.onClear) filter?.onClear?.();
    else context.list.removeParams([column.columnKey]);
  };

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

  const contentWidth = useMemo(() => {
    const padding = 12;
    const gap = 6;

    const sortIconSize = column.sortable ? 16 + gap : 0;
    const columnIconSize = column?.icon ? 16 + gap : 0;
    const filterIconSize = filter?.active ? 16 + gap : 0;

    return column.width - padding * 2 - sortIconSize - columnIconSize - filterIconSize;
  }, [column.width, column.sortable, column.icon, column.minWidth, filter?.active]);

  return (
    <Group
      gap="6px"
      align="center"
      w="100%"
      maw="100%"
      wrap="nowrap"
      style={{ overflow: "hidden" }}
      className={filter?.onClick ? "clickable" : undefined}
      onClick={filter?.onClick}
    >
      {column?.icon && typeof column.icon !== "boolean" && (
        <Group style={{ width: 16, height: 16 }} justify="center" align="center">
          <column.icon size={16} color={filter?.active ? color("primary") : undefined} />
        </Group>
      )}

      <Text
        ta={column.align ?? "left"}
        truncate
        fz={13}
        fw={500}
        title={getColumnName(column.columnKey)}
        style={{ width: contentWidth }}
      >
        {columnName}
      </Text>

      <Group gap={0} wrap="nowrap">
        {filter?.active && (
          <Tooltip label={<Trans>Clear filter</Trans>}>
            <ActionIcon
              variant="subtle"
              color="var(--mantine-color-dimmed)"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClearFilter();
              }}
            >
              <IconMinus size={16} />
            </ActionIcon>
          </Tooltip>
        )}

        {column.sortable && (
          <ActionIcon
            variant="subtle"
            color="var(--mantine-color-dimmed)"
            size="sm"
            onClick={onSort}
          >
            <IconSelector size={16} ref={sortIconRef} />
          </ActionIcon>
        )}
      </Group>
    </Group>
  );
};

export const ListTableHead: FC<{
  column: TableColumn;
  style?: CSSProperties;
  className?: string;
}> = ({ column, style, className }) => {
  const { changeColumnState, fixedParams } = useListContext();
  const hover = useHover();
  const color = useColor();
  const isReadonly = Boolean(fixedParams?.[column.columnKey]);

  const resize = useColumnResize({
    columnKey: column.columnKey,
    minWidth: column.minWidth,
    initialWidth: column.width,
    disabled: !column.resizable,
    onResize: (columnKey, width) => {
      changeColumnState(columnKey, { width });
    },
  });

  const FilterComponent = getFilterComponent(column);
  const filterWrapper: FilterWrapper = useMemo(() => {
    return (filter) => (
      <TableHeadContent column={{ ...column, width: resize.currentWidth }} filter={filter} />
    );
  }, [column, resize.currentWidth]);

  return (
    <th
      className={classNames(styles.TableHead, "unselectable", className)}
      ref={hover.ref}
      data-column-key={column.columnKey}
      style={{
        width: column.width,
        minWidth: column.width,
        maxWidth: column.width,
        cursor: resize.isResizing ? "col-resize" : "default",
        position: "relative",
        overflow: "visible",
        ...style,
      }}
    >
      {isReadonly || !FilterComponent ? (
        <TableHeadContent column={column} />
      ) : (
        <FilterComponent wrapper={filterWrapper} column={column} />
      )}

      <Stack
        pos="absolute"
        top={0}
        justify="center"
        align="end"
        bottom={0}
        bg="transparent"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={resize.handleMouseDown}
        className={styles.ResizeHandle}
        style={{
          width: 6,
          left: resize.currentWidth - 6,
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
