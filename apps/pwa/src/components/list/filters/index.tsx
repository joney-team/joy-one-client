"use client";

import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { t } from "@lingui/core/macro";
import { Group } from "@mantine/core";
import { IconFilter, IconFilterFilled, IconRefresh } from "@tabler/icons-react";
import { FC } from "react";
import { ActionButton } from "../components/action-button";
import { useListContext } from "../list-context";
import { TableColumn } from "../types";
import { DynamicSelectorFilter } from "./dynamic-selector-filter";
import { StaticSelectorFilter } from "./static-selector-filter";
import { TextFilter } from "./text-filter";
import { TimeRangeFilter } from "./time-range-filter";
import { FilterProps, FilterWrapper } from "./types";

export const getFilterComponent = (column: TableColumn): FC<FilterProps<any>> | null => {
  if (column.filter?.dynamicSelector) {
    return DynamicSelectorFilter;
  }

  if (column.filter?.staticSelector) {
    return StaticSelectorFilter;
  }

  if (column.filter?.timeRange) {
    return TimeRangeFilter;
  }

  if (column.filter?.text) {
    return TextFilter;
  }

  return null;
};

export const FilterItem: FC<{
  column: TableColumn;
}> = ({ column }) => {
  const ctx = useListContext();

  const wrapper: FilterWrapper = ({
    children,
    onClick,
    quantity,
    quantityColor,
    onClear,
    active,
  }) => {
    const isReadonly = Boolean(ctx.fixedParams?.[column.columnKey]);
    return (
      <ActionButton
        icon={column.icon || IconFilter}
        label={column.name || column.columnKey}
        onClear={
          active && !isReadonly
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onClear) onClear();
                else {
                  ctx.list.removeParams([column.columnKey]);
                }
              }
            : undefined
        }
        onClick={isReadonly ? undefined : onClick}
        quantity={quantity}
        quantityColor={quantityColor}
        active={active}
      >
        {children}
      </ActionButton>
    );
  };

  const FilterComponent = getFilterComponent(column);
  if (!FilterComponent) return null;

  const generalFilterProps: FilterProps = {
    wrapper,
    column,
    ...ctx,
  };

  return <FilterComponent {...generalFilterProps} />;
};

export const FilterBar: FC = () => {
  const ctx = useListContext();
  const isHasFilter = Object.values(ctx.columns).some((v) => v?.filter);
  const onReset = () => ctx.list.removeAllParams();
  const workspaceLayout = useWorkspaceLayout();

  const filterCount = Object.keys(ctx.list.params).reduce((acc, key) => {
    const ignoreKeys = ["sort"];
    if (ignoreKeys.some((v) => key.indexOf(v) > -1) || Boolean(ctx.fixedParams?.[key])) return acc;
    return acc + 1;
  }, 0);

  if (!ctx.viewState.isFilterVisible || !isHasFilter) return null;

  return (
    <Group
      gap={ctx.spacing}
      p={ctx.spacing}
      style={{ borderTop: `1px solid ${workspaceLayout.dividerColor}` }}
      align="start"
    >
      <Group gap={ctx.spacing} flex={1}>
        {ctx.columns.map((column) => {
          if (!column || !column.filter) return null;

          return (
            <Group key={column.columnKey}>
              <FilterItem key={column.columnKey} {...ctx} column={column} />
            </Group>
          );
        })}
      </Group>

      <ActionButton
        icon={IconRefresh}
        label={t`Clear filter`}
        onClick={onReset}
        borderStyle="dashed"
        disabled={filterCount === 0}
      />
    </Group>
  );
};

export const Filter: FC = () => {
  const layout = useLayout();
  const ctx = useListContext();
  const isHasFilter = Object.values(ctx.columns).some((v) => v?.filter);

  if (!isHasFilter) return null;

  const filterCount = Object.keys(ctx.list.params).reduce((acc, key) => {
    const ignoreKeys = ["sort"];
    if (ignoreKeys.some((v) => key.indexOf(v) > -1) || Boolean(ctx.fixedParams?.[key])) return acc;
    return acc + 1;
  }, 0);

  return (
    <ActionButton
      icon={IconFilter}
      activeIcon={IconFilterFilled}
      label={layout.view !== "mobile" ? t`Filter` : ""}
      onClick={() =>
        ctx.setViewState({ ...ctx.viewState, isFilterVisible: !ctx.viewState.isFilterVisible })
      }
      active={ctx.viewState.isFilterVisible}
      quantity={filterCount}
    />
  );
};
