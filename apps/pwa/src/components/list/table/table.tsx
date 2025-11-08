"use client";

import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { BaseData, TableColumn } from "@/components/list/types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ActionIcon, Center, Checkbox, Group, Loader, Menu, Stack, Text } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";
import Link from "next/link";
import { CSSProperties, useEffect, useRef } from "react";
import { getIn, getListDataId, getValuePath } from "../utils";
import { ListTableHead } from "./table-head";

import { useColor } from "@/modules/theme/use-color";
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

export default function ListTable<T extends BaseData>() {
  const context = useListContext();
  const workspace = useWorkspace();
  const color = useColor();

  // Refs for sticky header
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const fixedHeaderRef = useRef<HTMLDivElement>(null);

  // Sync horizontal scroll
  useEffect(() => {
    const tableScroll = tableScrollRef.current;
    const fixedHeader = fixedHeaderRef.current;

    if (!tableScroll || !fixedHeader) return;

    const handleScroll = () => {
      fixedHeader.scrollLeft = tableScroll.scrollLeft;
    };

    tableScroll.addEventListener("scroll", handleScroll);
    return () => tableScroll.removeEventListener("scroll", handleScroll);
  }, []);

  const isSelectedAll =
    context.list.data.length > 0 &&
    context.list.data.every((v: any) => context.selectedIds.includes(v.id || v._id || ""));

  return (
    <Stack className={styles.Table} pos="relative" w="100%" gap={0}>
      {/* Fixed Header */}
      <Stack
        ref={fixedHeaderRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          overflow: "hidden",
        }}
      >
        <table
          style={{
            tableLayout: "fixed",
            borderTop: `1px solid var(--table-border-color)`,
            position: "relative",
          }}
        >
          <thead>
            <tr style={{ background: color({ light: "gray.1", dark: "dark.7" }) }}>
              {context.isBulkActionsActivated && (
                <th className={styles.BulkActionsCell}>
                  <Group justify="end">
                    <Checkbox
                      size="xs"
                      radius={5}
                      checked={isSelectedAll}
                      onChange={() => (isSelectedAll ? context.unselectAll() : context.selectAll())}
                    />
                  </Group>
                </th>
              )}

              {context.columns.map((column) => {
                if (!column.isVisible) return null;
                const pinnedPosition = getPinnedPositionStyle({
                  columns: context.columns,
                  column,
                });

                return (
                  <ListTableHead
                    key={column.columnKey}
                    column={column}
                    style={{
                      ...pinnedPosition.style,
                      backgroundColor: color({ light: "gray.1", dark: "dark.7" }),
                    }}
                  />
                );
              })}

              {context.actions.length > 0 && <th className={styles.ActionColumn} />}
              <th />
            </tr>
          </thead>
        </table>
      </Stack>

      <Stack ref={tableScrollRef} maw="100%" pos="relative" style={{ overflowX: "auto" }}>
        <table style={{ position: "relative" }}>
          <tbody>
            {context.list.data.map((rowData: T) => {
              const id = getListDataId(rowData);
              const isSelected = context.selectedIds.includes(id);

              return (
                <tr key={id}>
                  {context.isBulkActionsActivated && (
                    <td
                      className={styles.BulkActionsCell}
                      onClick={(e) => {
                        if (isSelected) return context.unselect(id);
                        return context.select(id, e.shiftKey);
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

                  {context.actions.length > 0 && (
                    <td className={styles.ActionColumn}>
                      <Menu>
                        <Menu.Target>
                          <Center>
                            <ActionIcon variant="subtle" color="gray">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Center>
                        </Menu.Target>

                        <Menu.Dropdown>
                          {context.actions.map((action) => {
                            const isDisabled =
                              (action.disabled && action.disabled?.(rowData) === true) ||
                              (action.permission && !workspace.hasPermission(action.permission));

                            if ("onClick" in action)
                              return (
                                <Menu.Item
                                  key={action.label}
                                  onClick={() => action.onClick(rowData)}
                                  leftSection={<action.icon size={16} />}
                                  disabled={isDisabled}
                                >
                                  {action.label}
                                </Menu.Item>
                              );

                            if ("href" in action)
                              return (
                                <Menu.Item
                                  key={action.label}
                                  component={Link}
                                  href={action.href(rowData)}
                                  leftSection={<action.icon size={16} />}
                                >
                                  {action.label}
                                </Menu.Item>
                              );
                          })}
                        </Menu.Dropdown>
                      </Menu>
                    </td>
                  )}

                  <td />
                </tr>
              );
            })}
          </tbody>

          {context.list.isFetching && (
            <caption style={{ padding: context.spacing * 2 }}>
              <Loader size="sm" type="dots" color="gray" />
            </caption>
          )}

          {context.list.isEmpty && (
            <caption style={{ padding: context.spacing }}>
              {context.components?.empty ? <context.components.empty /> : <Empty hideBorder />}
            </caption>
          )}

          {context.list.isHasError && (
            <caption style={{ padding: context.spacing }}>
              <Errored error={context.list.error} />
            </caption>
          )}
        </table>
      </Stack>
    </Stack>
  );
}
