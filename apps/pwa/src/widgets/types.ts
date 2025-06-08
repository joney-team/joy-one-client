import type { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import type { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import type { Icon } from "@tabler/icons-react";
import type { FC } from "react";
import type { Layout } from "react-grid-layout";

export interface WidgetLayoutConfig {
  initH?: number;
  initW?: number;
  minH?: number;
  minW?: number;
  maxH?: number;
  maxW?: number;
}

export interface WidgetConfig {
  name: string;
  defaultState?: any;
  permissions?: WorkspacePermission[];
  workspaceTypes?: WorkspaceType[];
  icon?: Icon;
  duplicate?: boolean;
  layout?: WidgetLayoutConfig;
}

export interface Widget<Type = string> {
  id: string;
  type: Type;
  state?: any;
}

export interface WidgetProps<ContextType = any, WidgetType = string> {
  id: string,
  ctx: ContextType,
  widgetsContext: WidgetsContext<ContextType, WidgetType>,
}

export interface WidgetModule<ContextType = any> {
  config: WidgetConfig
  component: WidgetComponent<ContextType>
}

export interface WidgetComponent<ContextType = any, WidgetType = string> extends FC<WidgetProps<ContextType, WidgetType> & {
  widget: Widget<WidgetType>,
  config: WidgetConfig,
}> { }

export type WidgetModules<ContextType = any, WidgetType = string> = {
  [key in WidgetType extends string ? WidgetType : string]: WidgetModule<ContextType>;
}

export type EWidgetModules<T extends string | number | symbol, ContextType = any> = {
  [key in T]: WidgetModule<ContextType>;
}

export interface WidgetsProps<ContextType = object, WidgetType = string> {
  id: string;
  context?: ContextType;
  widgets?: Widget<WidgetType>[] | null;
  defaultWidgets?: Widget<WidgetType>[] | null;
  modules: WidgetModules<ContextType, WidgetType>;
  readonly?: boolean;
  onChange?: (widgets: Widget<WidgetType>[] | null) => void;
}

export interface WidgetsContext<ContextType = any, WidgetType = string> {
  remove: (id: string) => void;
  context: ContextType;
  widgets: Widget<WidgetType>[];
  getState: (id: string, key: string) => any;
  updateState: (id: string, key: string, value: any) => void;
}

export interface WidgetStorage {
  version: string;
  layout?: Layout[] | null;
}