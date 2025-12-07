"use client";

import { zIndexes } from "@joy-one-client/config/layout";
import { Portal } from "@mantine/core";
import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { TaskMenuContext } from "./task-menu";
import { TaskMenuDropdown } from "./task-menu-dropdown";
import type { TaskMenu } from "./task-menu-types";

import styles from "./task-menu.module.css";
import { classNames } from "@/utils/ui.utils";

export const TaskMenuProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [version, setVersion] = useState(0);
  const [taskMenu, setTaskMenu] = useState<TaskMenu>();

  const menuRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  const onClose = () => {
    if (menuRef.current) {
      menuRef.current.classList.remove(styles.AnimatedIn);
      menuRef.current?.style.setProperty("display", "none");
      menuRef.current?.style.removeProperty("left");
      menuRef.current?.style.removeProperty("top");
      menuRef.current?.classList.remove(styles.AnimatedOut);
      setTaskMenu(undefined);
    }
  };

  useEffect(() => {
    if (taskMenu && menuRef.current) {
      const placeMenu = () => {
        const { x, y } = taskMenu.target.getBoundingClientRect();
        const { height } = taskMenu.target.getBoundingClientRect();
        const placeX = taskMenu.position?.x ?? x + (taskMenu.offset?.x ?? 0);
        const placeY = taskMenu.position?.y ?? y + height + (taskMenu.offset?.y ?? 0);
        menuRef.current?.style.setProperty("left", `${placeX}px`);
        menuRef.current?.style.setProperty("top", `${placeY}px`);
      };

      placeMenu();

      // Make menu visible and trigger animation
      menuRef.current.style.setProperty("display", "block");
      // Use requestAnimationFrame to ensure the display change is applied before animation
      requestAnimationFrame(() => {
        menuRef.current?.classList.add(styles.AnimatedIn);
      });

      const onMouseDown = (e: MouseEvent) => {
        if (e.target && !menuRef.current?.contains(e.target as Node)) {
          onClose();
        }
      };

      rootRef.current?.addEventListener("scroll", placeMenu);
      document.addEventListener("mousedown", onMouseDown);
      window.addEventListener("resize", placeMenu);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      window.addEventListener("keydown", onKeyDown);

      return () => {
        onClose();
        document.removeEventListener("mousedown", onMouseDown);
        rootRef.current?.removeEventListener("scroll", placeMenu);
        window.removeEventListener("resize", placeMenu);
        window.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [menuRef.current, taskMenu, version, onClose]);

  return (
    <TaskMenuContext.Provider
      value={{
        open: (menu) => {
          setTaskMenu(menu);
          setVersion((s) => s + 1);
        },
        setRoot: (root) => {
          rootRef.current = root as HTMLDivElement;
        },
        isOpened: !!taskMenu,
      }}
    >
      {children}

      <Portal>
        <div
          ref={menuRef}
          className={classNames(styles.TaskMenu, styles.TaskMenuDropdown)}
          style={{ display: "none", position: "fixed", zIndex: zIndexes.taskMenu }}
        >
          {taskMenu && <TaskMenuDropdown {...taskMenu} onClose={onClose} />}
        </div>
      </Portal>
    </TaskMenuContext.Provider>
  );
};
