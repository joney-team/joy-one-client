import type { BaseData } from "@joy-one/utils/base-data";
import type { ComponentType, FC, MouseEvent, ReactNode, RefObject } from "react";
import type { PlaceDropdownMenuOptions } from "./context-menu-helpers";

export type OpenContextMenuArgs<T extends BaseData = BaseData, Context = unknown> = {
  data: T;
  context?: Context;
  onClose?: () => void;
  options?: PlaceDropdownMenuOptions;
} & ({ target: HTMLElement } | { event: MouseEvent });

export type ContextMenuDropdownComponentProps<T extends BaseData = BaseData, Context = unknown> = {
  data: T | null;
  context: Context | null;
  setClickOutsideToClose: (enabled: boolean) => void;
  onClose: () => void;
};

export type ContextMenuType<T extends BaseData = BaseData> = {
  menuRef: RefObject<HTMLDivElement | null>;
  targetRef: RefObject<HTMLElement | null>;
  menuArgsRef: RefObject<OpenContextMenuArgs<T> | null>;
  open: (args: OpenContextMenuArgs<T>) => void;
  close: () => void;
};

export type ContextMenuDropdownComponent<T extends BaseData = BaseData, Context = unknown> =
  | FC<ContextMenuDropdownComponentProps<T>>
  | ComponentType<ContextMenuDropdownComponentProps<T, Context>>;

export type ContextMenuProps<T extends BaseData = BaseData, Context = unknown> = {
  id?: string;
  root?: RefObject<HTMLElement | null>;
  children: ReactNode | ((context: ContextMenuType<T>) => ReactNode);
  dropdown: ContextMenuDropdownComponent<T extends BaseData ? T : never, Context>;
  options?: PlaceDropdownMenuOptions;
  disabled?: boolean;
};
