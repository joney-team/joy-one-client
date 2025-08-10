"use client";

import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { t } from "@/modules/lang/lang-service";
import { Group } from "@mantine/core";
import { IconFilter, IconFilterFilled, IconRefresh } from "@tabler/icons-react";
import { FC, MouseEventHandler } from "react";
import { ActionButton } from "../components/action-button";
import { Column, ListContext } from "../types";
import { DynamicSelectorFilter } from "./dynamic-selector-filter";
import { StaticSelectorFilter } from "./static-selector-filter";
import { TextFilter } from "./text-filter";
import { TimeRangeFilter } from "./time-range-filter";
import { FilterProps, FilterWrapperProps } from "./types";

export const FilterItem: FC<
  ListContext & {
    colKey: string;
    column: Column<any, any>;
  }
> = ({ colKey, column, list, ...ctx }) => {
  const onReset: MouseEventHandler<HTMLElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    list.removeParam(colKey);
  };

  const Wrapper: FilterWrapperProps = ({
    children,
    onClick,
    quantity,
    quantityColor,
    onClear,
    active,
  }) => {
    const isHasValue = !!list.params[colKey] || onClear;
    return (
      <ActionButton
        icon={column.icon || IconFilter}
        label={t(column.name || colKey)}
        onClear={onClear || (isHasValue ? onReset : undefined)}
        onClick={onClick}
        quantity={quantity}
        quantityColor={quantityColor}
        active={active}
      >
        {children}
      </ActionButton>
    );
  };

  const generalFilterProps: FilterProps<any> = {
    colKey,
    list,
    Wrapper,
    config: {},
    column,
    ...ctx,
  };

  if (column.filter?.dynamicSelector) {
    return <DynamicSelectorFilter {...generalFilterProps} config={column.filter.dynamicSelector} />;
  }

  if (column.filter?.staticSelector) {
    return <StaticSelectorFilter {...generalFilterProps} config={column.filter.staticSelector} />;
  }

  if (column.filter?.timeRange) {
    return <TimeRangeFilter {...generalFilterProps} config={column.filter.timeRange} />;
  }

  if (column.filter?.text) {
    return <TextFilter {...generalFilterProps} config={column.filter.text} />;
  }

  return null;
};

export const FilterBar: FC<ListContext> = (ctx) => {
  const isHasFilter = Object.values(ctx.columns).some((v) => v?.filter);
  const onReset = () => ctx.list.removeAllParams();
  const workspaceLayout = useWorkspaceLayout();

  if (!ctx.viewState.isFilterVisible || !isHasFilter) return null;

  return (
    <Group
      gap={ctx.spacing}
      p={ctx.spacing}
      style={{ borderTop: `1px solid ${workspaceLayout.dividerColor}` }}
      align="start"
    >
      <Group gap={ctx.spacing} flex={1}>
        {ctx.columnSettings.map(({ id: colKey }) => {
          const column = ctx.columns[colKey];
          if (!column || !column.filter) return null;

          return <FilterItem key={colKey} {...ctx} colKey={colKey} column={column} />;
        })}
      </Group>

      <ActionButton
        icon={IconRefresh}
        label={t("reset")}
        onClick={onReset}
        borderStyle="dashed"
        disabled={!isHasFilter}
      />
    </Group>
  );
};

export const Filter: FC<ListContext> = (ctx) => {
  const layout = useLayout();
  const isHasFilter = Object.values(ctx.columns).some((v) => v?.filter);

  if (!isHasFilter) return null;

  const filterCount = Object.keys(ctx.list.params).reduce((acc, key) => {
    const ignoreKeys = ["sort"];
    if (ignoreKeys.some((v) => key.indexOf(v) > -1)) return acc;
    return acc + 1;
  }, 0);

  return (
    <ActionButton
      icon={IconFilter}
      activeIcon={IconFilterFilled}
      label={layout.view !== "mobile" ? t("filter") : ""}
      onClick={() =>
        ctx.setViewState({ ...ctx.viewState, isFilterVisible: !ctx.viewState.isFilterVisible })
      }
      active={ctx.viewState.isFilterVisible}
      quantity={filterCount}
    />
  );
};
