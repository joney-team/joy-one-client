import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { ActionIcon, Checkbox, Group, Loader, Menu, Table, Text } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";
import { ListContext } from "../types";
import { getIn, getListDataId, getValuePath } from "../utils";
import { ListTableHead } from "./table-head";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@/modules/lang/lang-service";
import { BaseData } from "@/components/list/types";
import Link from "next/link";

export default function ListTable<T extends BaseData>(ctx: ListContext<T>) {
  const actions = ctx.actions || [];
  const workspace = useWorkspace();

  return (
    <Table
      miw="max-content"
      withColumnBorders
      withTableBorder
      horizontalSpacing={10}
      verticalSpacing={10}
      style={{
        borderBottom: "none",
        borderLeft: "none",
        borderRight: "none",
      }}
      stickyHeader
    >
      <Table.Thead>
        <Table.Tr bg="var(--mantine-color-default-hover)">
          {ctx.columnSettings.map((col, colIndex) => {
            const column = ctx.columns[col.id as keyof T];
            if (!col.isVisible || !column) return null;
            return <ListTableHead colIndex={colIndex} key={col.id} columnId={col.id} {...ctx} />;
          })}

          {actions.length > 0 && <Table.Th />}
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {ctx.list.data.map((item: T) => {
          const id = getListDataId(item);
          return (
            <Table.Tr key={id}>
              {ctx.columnSettings.map((columnSetting, colIndex) => {
                if (!columnSetting.isVisible) return null;

                const column = ctx.columns[columnSetting.id as keyof T];
                if (!column) return null;

                const isShowSelect = colIndex === 0 && ctx.isShowMultipleSelectActions;

                const w = isShowSelect && column.w ? column.w + 38 : column.w;
                const isSelected = ctx.selectedIds.includes(id);

                return (
                  <Table.Td
                    pl={isShowSelect ? 10 : undefined}
                    key={columnSetting.id}
                    w={w}
                    align={column.align}
                  >
                    <Group wrap="nowrap" gap={4} justify={column.align}>
                      {isShowSelect && (
                        <Checkbox
                          size="xs"
                          className="clickable"
                          radius={5}
                          checked={isSelected}
                          onChange={() => {}}
                          onClick={(e) => {
                            return isSelected ? ctx.unselect(id) : ctx.select(id, e.shiftKey);
                          }}
                        />
                      )}

                      {(function () {
                        const value = getIn(item, getValuePath(columnSetting.id, column));
                        if (column.render) {
                          const Renderer = column.render;
                          return <Renderer value={value} data={item} />;
                        }

                        if (value) return <Text>{value}</Text>;
                        return null;
                      })()}
                    </Group>
                  </Table.Td>
                );
              })}

              {actions.length > 0 && (
                <Table.Td w={38} px={5}>
                  <Menu>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      {actions.map((action) => {
                        const isDisabled =
                          (action.disabled && action.disabled?.(item) === true) ||
                          (action.permission && !workspace.hasPermission(action.permission));

                        if ("onClick" in action)
                          return (
                            <Menu.Item
                              key={action.label}
                              onClick={() => action.onClick(item)}
                              leftSection={<action.icon size={16} />}
                              disabled={isDisabled}
                            >
                              {t(action.label)}
                            </Menu.Item>
                          );

                        if ("href" in action)
                          return (
                            <Menu.Item
                              key={action.label}
                              component={Link}
                              href={action.href(item)}
                              leftSection={<action.icon size={16} />}
                            >
                              {t(action.label)}
                            </Menu.Item>
                          );
                      })}
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              )}
            </Table.Tr>
          );
        })}
      </Table.Tbody>

      {ctx.list.isFetching && (
        <Table.Caption pt={0} pb={ctx.spacing * 2}>
          <Loader size="sm" type="dots" color="gray" />
        </Table.Caption>
      )}

      {ctx.list.isEmpty && (
        <Table.Caption p={ctx.spacing}>
          {ctx.components?.empty ? <ctx.components.empty /> : <Empty hideBorder />}
        </Table.Caption>
      )}

      {ctx.list.isHasError && (
        <Table.Caption p={ctx.spacing}>
          <Errored error={ctx.list.error} />
        </Table.Caption>
      )}
    </Table>
  );
}
