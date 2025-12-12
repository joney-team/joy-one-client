"use client";

import { BaseData } from "@joy-one-client/utils/base-data";
import { createContext, useContext } from "react";
import { ContextMenuType } from "./context-menu-types";

export const ContextMenuContext = createContext<ContextMenuType>({} as ContextMenuType);

export const useContextMenu = <T extends BaseData = BaseData>() => {
  return useContext(ContextMenuContext) as unknown as ContextMenuType<T>;
};
