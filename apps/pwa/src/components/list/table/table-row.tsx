"use client";

import { TableColumn } from "@/components/list/types";
import { Checkbox, Group, Text } from "@mantine/core";
import { CSSProperties } from "react";
import { getIn, getValuePath } from "../list-utils";

import { useContextMenu } from "@/components/context-menu/context-menu";
import { type BaseData } from "@joy-one-client/utils/base-data";
import { useListContext } from "../list-context";
import styles from "./table.module.css";

const getPinnedPositionStyle = (args: {
  columns: TableColumn[];
  column: TableColumn;
}): {
  style?: CSSProperties | undefined;
} => {
  if (args.column.pinned === "right") {
    const rightPinnedColumns = [
      ...args.columns.filter((c) => c.pinned === "right" && c.isVisible),
    ].reverse();
    const columnIndex = rightPinnedColumns.findIndex((c) => c.columnKey === args.column.columnKey);
    const right = rightPinnedColumns.slice(0, columnIndex).reduce((acc, c) => acc + c.width, 0);

    return {
      style: {
        right,
        position: "sticky",
        zIndex: 1,
      },
    };
  }

  if (args.column.pinned === "left") {
    const leftPinnedColumns = [...args.columns.filter((c) => c.pinned === "left" && c.isVisible)];
    const columnIndex = leftPinnedColumns.findIndex((c) => c.columnKey === args.column.columnKey);
    const left = leftPinnedColumns.slice(0, columnIndex).reduce((acc, c) => acc + c.width, 0);

    return {
      style: {
        left,
        position: "sticky",
        zIndex: 1,
      },
    };
  }

  return {};
};

export function TableRow({
  rowData,
  isSelected,
  id,
  isBulkActionsActivated,
}: {
  rowData: BaseData;
  isSelected: boolean;
  id: string;
  isBulkActionsActivated: boolean;
}) {
  const context = useListContext();
  const contextMenu = useContextMenu<BaseData>();

  return (
    <tr
      data-id={id}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.currentTarget;
        target.setAttribute("data-context-menu-opened", "true");

        contextMenu.open({
          target,
          data: rowData,
          onClose: () => {
            target?.removeAttribute("data-context-menu-opened");
          },
          offset: { y: -5, x: e.clientX - target.getBoundingClientRect().left },
        });
      }}
    >
      {isBulkActionsActivated && (
        <td
          className={styles.BulkActionsCell}
          onClick={(e) => {
            if (isSelected) return context.unselect(id);
            return context.select(id, { isShiftKey: e.shiftKey });
          }}
        >
          <Group justify="end">
            <Checkbox
              size="xs"
              className="clickable"
              radius={5}
              checked={isSelected}
              onChange={() => {}}
            />
          </Group>
        </td>
      )}

      {context.columns.map((column) => {
        if (!column.isVisible) return null;
        const columnData = getIn(rowData, getValuePath(column.columnKey, column));
        const Renderer = column.render;
        const pinnedPosition = getPinnedPositionStyle({
          columns: context.columns,
          column,
        });

        return (
          <td
            key={column.columnKey}
            style={{
              width: column.width,
              maxWidth: column.width,
              minWidth: column.width,
              ...pinnedPosition.style,
            }}
            data-body-column-key={column.columnKey}
          >
            <Group
              wrap="nowrap"
              gap={4}
              justify={column.align}
              style={{ overflow: "visible", width: "100%" }}
              flex={1}
              miw={0}
            >
              {Renderer ? (
                <Renderer value={columnData} data={rowData} />
              ) : (
                <Text ta={column.align ?? "left"} truncate title={columnData}>
                  {columnData}
                </Text>
              )}
            </Group>
          </td>
        );
      })}

      <td className={styles.SpaceCell} />
    </tr>
  );
}
