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

import { getId, type BaseData } from "@joy-one/utils/base-data";
import { requestAnimationFrameTimes } from "@joy-one/utils/request-animation-frame";
import { placeDropdownMenuByMouseEvent, placeDropdownMenuByTarget } from "./context-menu-helpers";
import styles from "./context-menu.module.css";

export const ContextMenuProvider = <T extends BaseData, Context = unknown>(
  props: ContextMenuProps<T, Context>
) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuArgsRef = useRef<OpenContextMenuArgs | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const onClose = () => {
    if (!menuRef.current) return;
    const targetMenuId = menuArgsRef.current?.data ? getId(menuArgsRef.current.data) : null;

    menuArgsRef.current?.onClose?.();
    menuArgsRef.current = null;

    menuRef.current.setAttribute("data-opened", "false");
    menuRef.current.classList.remove(styles.AnimatedIn);

    if (targetMenuId) {
      document.getElementById(targetMenuId)?.removeAttribute("data-context-menu-opened");
    }
  };

  const onOpen = (args: OpenContextMenuArgs) => {
    if (!menuRef.current || props.disabled) return;

    const oldMenuId = menuArgsRef.current?.data ? getId(menuArgsRef.current.data) : null;
    const newMenuId = args.data ? getId(args.data) : null;
    const isSameMenu = oldMenuId === newMenuId;

    if (isSameMenu) {
      requestAnimationFrameTimes(() => {
        if (!menuRef.current) return;

        menuArgsRef.current = args;
        menuRef.current.setAttribute("data-key", Date.now().toString());

        const event = "event" in args ? args.event : null;
        const target = "target" in args ? args.target : null;

        if (event) {
          placeDropdownMenuByMouseEvent({
            event,
            menu: menuRef.current,
            options: args.options,
          });
        } else if (target) {
          placeDropdownMenuByTarget({ target, menu: menuRef.current, options: args.options });
        }

        if (newMenuId) {
          document.getElementById(newMenuId)?.setAttribute("data-context-menu-opened", "true");
        }
      });
    } else {
      onClose();

      requestAnimationFrameTimes(() => {
        if (!menuRef.current) return;
        menuArgsRef.current = args;
        menuRef.current.setAttribute("data-opened", "true");

        requestAnimationFrameTimes(() => {
          if (!menuRef.current) return;
          menuRef.current.classList.add(styles.AnimatedIn);

          const event = "event" in args ? args.event : null;
          const target = "target" in args ? args.target : null;

          if (event) {
            placeDropdownMenuByMouseEvent({
              menu: menuRef.current,
              event,
              options: args.options,
            });
          } else if (target) {
            placeDropdownMenuByTarget({ target, menu: menuRef.current, options: args.options });
          }

          if (newMenuId) {
            document.getElementById(newMenuId)?.setAttribute("data-context-menu-opened", "true");
          }
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
