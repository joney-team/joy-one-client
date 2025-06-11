import type { Icon } from "@tabler/icons-react";
import type { FC } from "react";
import type { DynamicSelectorFilterConfig } from "./filters/dynamic-selector-filter";
import type { StaticSelectorFilterConfig } from "./filters/static-selector-filter";
import type { TextFilterConfig } from "./filters/text-filter";
import type { TimeRangeFilterConfig } from "./filters/time-range-filter";
import { UseList } from "@/utils/use-list.util";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { ResponseList } from "@/types";
import { EventType } from "@/modules/events/event-types";

export type ListSort = {
  label: string;
  value: string;
  icon?: Icon;
};

export type ColumnItemRenderer<FieldValue, Data> = FC<{
  value: FieldValue | undefined;
  data: Data;
}>;

export type ExportToExcelItem = {
  text?: string | undefined;
  imageUrl?: string | undefined;
  money?: number | undefined;
  number?: number | undefined;
  date?: number;
};

export type ExportToExcel<Data, FieldType> = (
  value: FieldType,
  data: Data
) => ExportToExcelItem | (ExportToExcelItem & { col: string })[];

export type Column<Data = any, FieldType = any> = {
  name?: string;
  valuePath?: string;
  icon?: Icon;
  activeIcon?: Icon;
  filter?: {
    staticSelector?: StaticSelectorFilterConfig;
    dynamicSelector?: DynamicSelectorFilterConfig;
    timeRange?: TimeRangeFilterConfig;
    text?: TextFilterConfig;
  };
  exportToExcel?: ExportToExcel<Data, FieldType> | false;
  w?: number;
  render?: ColumnItemRenderer<FieldType, Data>;
  align?: "left" | "center" | "right";
  isSortable?: boolean;
  isDefaultHide?: boolean;
  disabled?: boolean;
};

export type Columns<Data = any> = {
  [key in keyof Data]?: Column<Data, Data[key]>;
};

export interface ListAction<Data> {
  label: string;
  icon: Icon;
  onClick: (data: Data) => void;
  disabled?: (data: Data) => boolean;
  permission?: WorkspacePermission;
}

export interface FilterMode<Data = any> {
  param: string;
  name: string;
  icon?: Icon;
  replaceFilterKeys?: (keyof Data)[];
  params: () => { [key: string]: any | any[] };
  disabled?: boolean;
}

export interface ListMultipleSelectAction<Data> {
  type?: "common" | "archive";
  label?: string;
  icon?: Icon;
  permission?: WorkspacePermission;
  available?: (data: Data[]) => boolean;
  handler: (data: Data[], ctx: { unSelect: () => void }) => Promise<any> | any;
}

export type ListFetch<Data = any> = (
  params: any,
  controller?: AbortController
) => Promise<ResponseList<Data & { id?: string; _id?: string }>>;

export type ListProps<Data = any> = (
  | { fetch: ListFetch<Data> }
  | { route: string; params?: Record<string, any> }
) & {
  id: string;
  name?: string;
  icon?: Icon;
  columns: Columns<Data>;
  filterModes?: FilterMode<Data>[];
  events?: EventType[];
  card?: FC<{ data: Data }>;
  actions?: ListAction<Data>[];
  limit?: number;
  creatable?: {
    onCreate: () => void;
    permission?: WorkspacePermission;
    label?: string;
    icon?: Icon;
  };
  components?: {
    empty?: FC;
  };
  multipleSelectActions?: ListMultipleSelectAction<Data>[];
};

export type ColumnSetting = {
  id: string;
  order: number;
  isVisible: boolean;
};

// Internal styles
export interface ListViewState {
  view: "table" | "grid";
  columnSettings: ColumnSetting[];
  isFilterVisible: boolean;
  activatedModes?: string[];
}

export type ListContext<Data = any> = ListProps<Data> & {
  list: UseList<Data>;
  viewState: ListViewState;
  setViewState: (viewState: ListViewState) => void;
  spacing: number;
  isViewStateChanged: boolean;
  onSaveViewState: () => void;
  toggleActivatedMode: (mode: string) => void;
  columnSettings: (ColumnSetting & { name?: string })[];
  selectedIds: string[];
  isShowMultipleSelectActions: boolean;
  select: (id: string, isShiftKey?: boolean) => void;
  unselect: (id: string) => void;
  selectAll: () => void;
  unselectAll: () => void;
  availableMultipleSelectActions: ListMultipleSelectAction<Data>[];
};
