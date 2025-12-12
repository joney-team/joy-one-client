"use client";

import { useRef } from "react";

import { Portal } from "@mantine/core";
import { ContextMenuContext } from "./context-menu";
import { ContextMenuDropdown } from "./context-menu-dropdown";
import {
  ContextMenuDropdownComponent,
  ContextMenuProps,
  ContextMenuType,
  OpenContextMenuArgs,
} from "./context-menu-types";

import { getId, type BaseData } from "@joy-one-client/utils/base-data";
import { placeDropdownMenu } from "./context-menu-helpers";
import styles from "./context-menu.module.css";

export const ContextMenuProvider = <T extends BaseData>(props: ContextMenuProps<T>) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuArgsRef = useRef<OpenContextMenuArgs | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const onClose = () => {
    if (!menuRef.current) return;
    menuArgsRef.current?.onClose?.();
    menuArgsRef.current = null;

    menuRef.current.setAttribute("data-opened", "false");
    menuRef.current.classList.remove(styles.AnimatedIn);
  };

  const onOpen = (args: OpenContextMenuArgs) => {
    if (!menuRef.current) return;

    const oldMenuId = menuArgsRef.current?.data ? getId(menuArgsRef.current.data) : null;
    const isSameMenu = oldMenuId === getId(args.data);

    if (isSameMenu) {
      requestAnimationFrame(() => {
        if (!menuRef.current) return;
        placeDropdownMenu({ ...args, menu: menuRef.current });
      });
    } else {
      onClose();

      requestAnimationFrame(() => {
        if (!menuRef.current) return;

        menuArgsRef.current = args;
        menuRef.current.setAttribute("data-opened", "true");

        requestAnimationFrame(() => {
          if (!menuRef.current) return;
          menuRef.current.classList.add(styles.AnimatedIn);
          placeDropdownMenu({ ...args, menu: menuRef.current });
        });
      });
    }
  };

  const contextValue: ContextMenuType = {
    menuRef,
    menuArgsRef,
    targetRef,
    open: onOpen,
    close: onClose,
  };

  const id = props.id ?? "context-menu";

  return (
    <ContextMenuContext.Provider value={contextValue}>
      {typeof props.children === "function"
        ? props.children(contextValue as unknown as ContextMenuType<T>)
        : props.children}

      <Portal>
        <div ref={menuRef} id={id} className={styles.ContextMenu}>
          <ContextMenuDropdown
            id={id}
            onClose={onClose}
            dropdown={props.dropdown as unknown as ContextMenuDropdownComponent}
          />
        </div>
      </Portal>
    </ContextMenuContext.Provider>
  );
};
