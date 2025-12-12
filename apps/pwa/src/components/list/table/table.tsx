"use client";

import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { TableColumn } from "@/components/list/types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { type BaseData, getId } from "@joy-one-client/utils/base-data";
import { Checkbox, Group, Loader, Stack } from "@mantine/core";
import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { ListTableHead } from "./table-head";

import { ContextMenuProvider } from "@/components/context-menu/context-menu-provider";
import { useColor } from "@/modules/theme/use-color";
import { useListContext } from "../list-context";
import { TableContextMenuDropdown } from "./table-context-menu-dropdown";
import { TableRow } from "./table-row";
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

  const isBulkActionsActivated = useMemo(() => {
    return (
      context.bulkActions.filter(
        (v) =>
          (!v.available ||
            v.available(context.list.data.filter((i) => context.selectedIds.includes(getId(i))))) &&
          (!v.permission || workspace.hasPermission(v.permission))
      ).length > 0
    );
  }, [context.bulkActions, context.selectedIds]);

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
              {isBulkActionsActivated && (
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
              <th className={styles.SpaceCell} />
            </tr>
          </thead>
        </table>
      </Stack>

      <ContextMenuProvider dropdown={TableContextMenuDropdown} id={context.id}>
        <Stack ref={tableScrollRef} maw="100%" pos="relative" style={{ overflowX: "auto" }}>
          <table style={{ position: "relative" }}>
            <tbody>
              {context.list.data.map((rowData: T) => {
                const id = getId(rowData);
                const isSelected = context.selectedIds.includes(id);

                return (
                  <TableRow
                    key={id}
                    rowData={rowData}
                    isSelected={isSelected}
                    id={id}
                    isBulkActionsActivated={isBulkActionsActivated}
                  />
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
      </ContextMenuProvider>
    </Stack>
  );
}
