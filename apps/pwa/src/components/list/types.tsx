import { UseList, UseListArgs } from "@/components/list/use-list";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { ResponseList } from "@/types";
import type { Icon } from "@tabler/icons-react";
import type { FC } from "react";
import type { DynamicSelectorFilterConfig } from "./filters/dynamic-selector-filter";
import type { StaticSelectorFilterConfig } from "./filters/static-selector-filter";
import type { TextFilterConfig } from "./filters/text-filter";
import type { TimeRangeFilterConfig } from "./filters/time-range-filter";

export type BaseData = { id: string } | { _id: string };

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

export type ExportToExcelOutput = ExportToExcelItem | (ExportToExcelItem & { col: string })[];

export type ExportToExcel<Data, FieldType> = (
  value: FieldType,
  data: Data
) => ExportToExcelOutput | Promise<ExportToExcelOutput>;

export type Column<Data = any, FieldType = any> = {
  name?: string;
  valuePath?: string;
  icon?: Icon | false;
  activeIcon?: Icon;
  filter?: {
    staticSelector?: StaticSelectorFilterConfig;
    dynamicSelector?: DynamicSelectorFilterConfig;
    timeRange?: TimeRangeFilterConfig;
    text?: TextFilterConfig;
  };
  exportToExcel?: ExportToExcel<Data, FieldType> | false;
  render?: ColumnItemRenderer<FieldType, Data>;
  align?: "left" | "center" | "right";
  defaultWidth?: number;
  minWidth?: number;
  defaultHidden?: boolean;
  sortable?: boolean;
  disabled?: boolean;
  resizable?: boolean;
};

export type Columns<Data = any> = {
  [key in keyof Data]?: Column<Data, Data[key]>;
};

export type ListAction<Data> = {
  label: string;
  icon: Icon;
  disabled?: (data: Data) => boolean;
  permission?: WorkspacePermission;
} & ({ onClick: (data: Data) => void } | { href: (data: Data) => string });

export interface FilterMode<Data = any> {
  param: string;
  name: string;
  icon?: Icon;
  replaceFilterKeys?: (keyof Data)[];
  params: () => { [key: string]: any | any[] };
  disabled?: boolean;
}

export interface ListBulkAction<Data> {
  type?: "common" | "archive";
  label?: string;
  icon?: Icon;
  permission?: WorkspacePermission;
  available?: (data: Data[]) => boolean;
  handler: (data: Data[], ctx: { unSelect: () => void; refetch: () => void }) => Promise<any> | any;
}

export type ListFetch<Data = any> = (
  params: any,
  controller?: AbortController
) => Promise<ResponseList<Data & { id?: string; _id?: string }>>;

export type ListProps<Data extends BaseData> = {
  id: string;
  route: string;
  columns: Columns<Data>;
  fixedParams?: Record<string, any>;
  name?: string;
  icon?: Icon;
  filterModes?: FilterMode<Data>[];
  events?: UseListArgs["events"];
  card?: FC<{ data: Data }>;
  actions?: ListAction<Data>[];
  limit?: number;
  creatable?: {
    permission?: WorkspacePermission;
    label?: string;
    icon?: Icon;
  } & ({ onCreate: () => void } | { href: string });
  components?: {
    empty?: FC;
  };
  bulkActions?: ListBulkAction<Data>[];
};

export type ColumnState = {
  order: number;
  isHidden: boolean;
  width?: number;
};

export type TableColumn<Data = any> = Omit<
  Column<Data>,
  "defaultWidth" | "minWidth" | "resizable" | "name"
> & {
  columnKey: string;
  width: number;
  isVisible: boolean;
  order: number;
  defaultWidth: number;
  minWidth: number;
  resizable: boolean;
  name: string;
};

// Internal styles
export interface ListViewState {
  view: "table" | "grid";
  columns: Record<string, ColumnState>;
  isFilterVisible: boolean;
  activatedModes?: string[];
}

export type ListContext<Data extends BaseData = any> = Omit<
  ListProps<Data>,
  "columns" | "actions"
> & {
  list: UseList<Data>;
  viewState: ListViewState;
  setViewState: (viewState: ListViewState) => void;
  spacing: number;
  toggleActivatedMode: (mode: string) => void;
  columns: Array<TableColumn>;
  selectedIds: string[];
  isBulkActionsActivated: boolean;
  select: (id: string, isShiftKey?: boolean) => void;
  unselect: (id: string) => void;
  selectAll: () => void;
  unselectAll: () => void;
  availableMultipleSelectActions: ListBulkAction<Data>[];
  changeColumnState: (columnKey: string, state: Partial<ColumnState>) => void;
  actions: ListAction<Data>[];
};
