"use client";

import { ViewportType } from "@/types";
import { createContext, useContext } from "react";

export interface LayoutState {
  width: number;
  height: number;
  isInitialized: boolean;
  isIpad: boolean;
  isStandalone: boolean;
  isAndroid: boolean;
  view: ViewportType;
  isBrowerCollapsed: boolean;
}

export interface LayoutComponents {
  pathname?: string,
  head?: React.ReactNode | string,
  navigation?: React.ReactNode,
}

export interface LayoutContext extends LayoutState {
  isResizing: boolean;
  components: LayoutComponents,
  setComponents: (args: LayoutComponents) => void;
  resetComponents: () => void;
}

export const Context = createContext<LayoutContext>({} as LayoutContext);

export const useLayout = () => useContext(Context);
