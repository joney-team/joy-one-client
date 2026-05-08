import { UseGraphqlList, UseGraphqlListArgs } from "@/components/list/use-graphql-list";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { ResponseList } from "@/types";
import type { Icon } from "@tabler/icons-react";
import type { FC, ReactNode } from "react";
import type { DynamicSelectorFilterConfig } from "./filters/dynamic-selector-filter";
import type { StaticSelectorFilterConfig } from "./filters/static-selector-filter";
import type { TextFilterConfig } from "./filters/text-filter";
import type { TimeRangeFilterConfig } from "./filters/time-range-filter";
import { BaseData } from "@joy-one-client/utils/base-data";
import { TypedDocumentNode } from "@apollo/client";

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
  text?: string | null;
  imageUrl?: string | null;
  money?: number | null;
  number?: number | null;
  date?: number | null;
};

export type ExportToExcelOutput = ExportToExcelItem | (ExportToExcelItem & { col: string })[];

export type ExportToExcel<Data, FieldType> = (
  value: FieldType,
  data: Data,
) => ExportToExcelOutput | Promise<ExportToExcelOutput>;

export type Column<Data = any, FieldType = any> = {
  name?: string | ReactNode;
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
  minWidth?: number;
  defaultWidth?: number;
  defaultHidden?: boolean;
  defaultPinned?: "left" | "right";
  sortable?: boolean;
  disabled?: boolean;
  resizable?: boolean;
};

export type Columns<Data = any> = {
  [key in keyof Data]?: Column<Data, Data[key]>;
};

export type ListAction<Data> = {
  label: ReactNode;
  icon: Icon;
  disabled?: (data: Data) => boolean;
  permission?: WorkspacePermission;
} & ({ onClick: (data: Data) => void } | { href: (data: Data) => string });

export interface FilterMode<Data = any> {
  param: string;
  name: ReactNode;
  icon?: Icon;
  replaceFilterKeys?: (keyof Data)[];
  params: () => { [key: string]: any | any[] };
  disabled?: boolean;
}

export interface ListBulkAction<Data> {
  label: ReactNode;
  icon: Icon;
  handler: (data: Data[], ctx: { unSelect: () => void; refetch: () => void }) => Promise<any> | any;
  type?: "common" | "archive";
  permission?: WorkspacePermission;
  available?: (data: Data[]) => boolean;
}

export type ListFetch<Data = any> = (
  params: any,
  controller?: AbortController,
) => Promise<ResponseList<Data & { id?: string; _id?: string }>>;

export type ListProps<Data extends BaseData = any> = {
  id: string;
  query: TypedDocumentNode;
  columns: Columns<Data>;
  fixedParams?: Record<string, any>;
  name?: ReactNode;
  icon?: Icon;
  filterModes?: FilterMode<Data>[];
  events?: UseGraphqlListArgs["events"];
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
  isVisible: boolean;
  width?: number;
  pinned?: "left" | "right" | null;
};

export type TableColumn<Data = any> = Omit<
  Column<Data>,
  "defaultWidth" | "minWidth" | "resizable" | "name"
> & {
  columnKey: string;
  width: number;
  isVisible: boolean;
  pinned: "left" | "right" | null;
  order: number;
  defaultWidth: number;
  minWidth: number;
  resizable: boolean;
  name: ReactNode;
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
  "columns" | "actions" | "bulkActions"
> & {
  list: UseGraphqlList<Data>;
  viewState: ListViewState;
  setViewState: (viewState: ListViewState) => void;
  spacing: number;
  toggleActivatedMode: (mode: string) => void;
  columns: TableColumn[];
  selectedIds: string[];
  select: (id: string, args?: { isShiftKey?: boolean; isReplace?: boolean }) => void;
  unselect: (id: string) => void;
  selectAll: () => void;
  unselectAll: () => void;
  changeColumnState: (columnKey: string, state: Partial<ColumnState>) => void;
  actions: ListAction<Data>[];
  bulkActions: ListBulkAction<Data>[];
  resetDefault: () => void;
  pointedId: string | null;
  setPointedId: (id: string | null) => void;
};
