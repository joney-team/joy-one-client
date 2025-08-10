import { capitalizeFirstLetter } from "@joy-one-client/utils/string";
import { ActionIcon, Group, Menu, Text } from "@mantine/core";
import { IconArrowDown, IconArrowsDownUp, IconArrowUp } from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { ActionButton } from "../components/action-button";
import { ListContext } from "../types";
import { getSortQueryKey, getColumnLabel } from "../utils";
import { useColor } from "@/modules/theme/use-color";
import { useLayout } from "@/layout/layout-context";
import { t } from "@/modules/lang/lang-service";

export const Sort: FC<ListContext> = (props) => {
  const { columns, list, columnSettings } = props;
  const color = useColor();
  const layout = useLayout();

  if (columnSettings.every((col) => !columns[col.id]?.isSortable)) return null;

  const sorting = columnSettings.filter(
    (col) => list.params[`sort${capitalizeFirstLetter(col.id, false)}`]
  );

  const onReset = () => {
    list.removeParams(sorting.map((col) => `sort${capitalizeFirstLetter(col.id, false)}`));
  };

  return (
    <Menu>
      <Menu.Target>
        <Group>
          <ActionButton
            icon={IconArrowsDownUp}
            label={layout.view === "mobile" ? null : t("sort")}
            quantity={sorting.length}
            onClear={sorting.length > 0 ? onReset : undefined}
            active={sorting.length > 0}
          />
        </Group>
      </Menu.Target>

      <Menu.Dropdown>
        {columnSettings.map((columnSetting) => {
          const column = columns[columnSetting.id];
          if (!column || !column.isSortable) return null;

          const queryKey = getSortQueryKey(columnSetting.id);
          const querySort = list.params[queryKey];

          const isAsc = querySort === "1";
          const isDesc = querySort === "-1";

          return (
            <Fragment key={columnSetting.id}>
              <Group justify="space-between" gap={8} py={8} px={4}>
                <Text flex={1} pl={4} fz={14}>
                  {t(getColumnLabel(columnSetting.id, column))}
                </Text>

                <Group gap={2}>
                  <ActionIcon
                    variant={isAsc ? "filled" : "subtle"}
                    color={color(isAsc ? "primary" : "dark")}
                    onClick={() => {
                      if (isAsc) return list.removeParam(queryKey);
                      return list.setParam(queryKey, "1");
                    }}
                  >
                    <IconArrowUp size={16} />
                  </ActionIcon>

                  <ActionIcon
                    variant={isDesc ? "filled" : "subtle"}
                    color={color(isDesc ? "primary" : "dark")}
                    onClick={() => {
                      if (isDesc) return list.removeParam(queryKey);
                      return list.setParam(queryKey, "-1");
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
