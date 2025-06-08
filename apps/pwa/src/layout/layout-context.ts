"use client";

import { ViewportType } from "@/types";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

export interface LayoutConfig {
  isNavbarCollapsed?: boolean;
}

export interface LayoutComponents {
  pathname?: string,
  head?: React.ReactNode | string,
  navigation?: React.ReactNode,
}

export interface LayoutContext {
  width: number;
  height: number;
  isInitialized: boolean;
  isIpad: boolean;
  isStandalone: boolean;
  isAndroid: boolean;
  isResizing: boolean;
  view: ViewportType;
  isBrowerCollapsed: boolean;
  spacing: number;

  headHeight: number,
  navigationHeight: number,
  sidebarWidth: number,
  navPaddingBottom: number,
  bodySize: {
    height: number,
    width: number,
  },

  border: string,
  borderColor: string,
  config: LayoutConfig;
  setConfig: Dispatch<SetStateAction<LayoutConfig>>,

  components: LayoutComponents,
  setComponents: (args: LayoutComponents) => void;
  resetComponents: () => void;
}

export const Context = createContext<LayoutContext>({} as LayoutContext);

export const useLayout = () => useContext(Context);
