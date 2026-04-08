"use client";

import { ViewportType } from "@/types";
import { capitalizeFirstLetter } from "@joy-one-client/utils/string";
import { Column, ColumnState, ListProps, ListViewState } from "./types";

export const getIn = (obj: any, path: string) => {
  try {
    var paths = path.split("."),
      current = obj,
      i;

    for (i = 0; i < paths.length; ++i) {
      if (current[paths[i]] == undefined) {
        return undefined;
      } else {
        current = current[paths[i]];
      }
    }

    return current;
  } catch (e) {
    return undefined;
  }
};

export const getValuePath = (key: string, column: Column<any, any>) => {
  return column.valuePath || key;
};

export const getColumnLabel = (key: string, column: Column<any, any>) => {
  return column.name || key;
};

export function getSortQueryKey(colId: string) {
  return `sort${capitalizeFirstLetter(colId, false)}`;
}

export function cleanObject<T extends Record<string, unknown>>(obj: T): T {
  return Object.keys(obj).reduce(
    (acc, key) => {
      if (obj[key] !== undefined && obj[key] !== null) {
        acc[key] = obj[key];
      }
      return acc;
    },
    {} as Record<string, unknown>,
  ) as T;
}

export function getColumnName(columnKey: string) {
  const ele = document.querySelector(`[data-column-name-key="${columnKey}"]`);
  if (!ele) return columnKey;
  return ele.textContent;
}

export function getListName() {
  const ele = document.getElementById("list-name");
  if (!ele) return "Data";
  return ele.textContent;
}

export function generateDefaultViewState(args: {
  element: HTMLDivElement | null;
  view: ViewportType;
  props: Pick<ListProps, "columns" | "card">;
}): ListViewState {
  if (!args.element) {
    return {
      view: args.view === "desktop" ? "table" : args.props.card ? "grid" : "table",
      columns: {},
      activatedModes: [],
      isFilterVisible: false,
    };
  }

  const defaultMinWidth = 100;
  const elementWidth = args.element.clientWidth;
  const nonDefaultWidthColumns = Object.values(args.props.columns).filter(
    (column) => column?.defaultHidden !== true && typeof column?.defaultWidth === "undefined",
  ).length;

  const totalRemainingWidth =
    elementWidth -
    Object.entries(args.props.columns).reduce((acc, [_, column]) => {
      if (column?.defaultHidden) return acc;
      return acc + (column?.defaultWidth ?? 0);
    }, 0);

  const avgNonDefaultWidth = Math.floor(totalRemainingWidth / nonDefaultWidthColumns) - 10;

  const columns: { cols: Record<string, ColumnState>; remainingWidth: number } = Object.entries(
    args.props.columns,
  ).reduce(
    (acc, [columnKey, column], columnIndex) => {
      if (!column) return acc;

      const { defaultWidth, minWidth } = column;

      const initialWidth =
        defaultWidth ?? Math.max(avgNonDefaultWidth, minWidth ?? defaultMinWidth);

      const columnState: ColumnState = {
        isVisible: typeof column?.defaultHidden === "boolean" ? !column.defaultHidden : true,
        width: initialWidth,
        order: columnIndex,
      };

      return {
        cols: {
          ...acc.cols,
          [columnKey]: columnState,
        },
        remainingWidth: acc.remainingWidth - initialWidth,
      };
    },
    { cols: {}, remainingWidth: elementWidth },
  );

  return {
    view: args.view === "desktop" ? "table" : args.props.card ? "grid" : "table",
    columns: columns.cols,
    activatedModes: [],
    isFilterVisible: false,
  };
}
