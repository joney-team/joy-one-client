import { capitalizeFirstLetter } from "@joy-one-client/utils/string";
import { BaseData, Column } from "./types";

export function getId(obj: BaseData) {
  if ("id" in obj) return obj.id;
  if ("_id" in obj) return obj._id;
  return "";
}

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

export function getListDataId<T = any>(data: T): string {
  if (data && typeof data === "object") {
    if ("id" in data && typeof data.id === "string") return data.id;
    if ("_id" in data && typeof data._id === "string") return data._id;
  }

  return "";
}

export function getSortQueryKey(colId: string) {
  return `sort${capitalizeFirstLetter(colId, false)}`;
}

export function cleanObject<T extends Record<string, unknown>>(obj: T): T {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined && obj[key] !== null) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Record<string, unknown>) as T;
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
