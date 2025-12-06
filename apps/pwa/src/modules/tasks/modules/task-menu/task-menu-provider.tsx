"use client";

import { zIndexes } from "@joy-one-client/config/layout";
import { Portal } from "@mantine/core";
import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { TaskMenuContext } from "./task-menu";
import { TaskMenuDropdown } from "./task-menu-dropdown";
import type { TaskMenu } from "./task-menu-types";

export const TaskMenuProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [version, setVersion] = useState(0);
  const [taskMenu, setTaskMenu] = useState<TaskMenu>();

  const menuRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  const onClose = () => {
    setTaskMenu(undefined);
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
      menuRef.current?.style.setProperty("display", "block");

      const onMouseDown = (e: MouseEvent) => {
        if (e.target && !menuRef.current?.contains(e.target as Node)) {
          onClose();
        }
      };

      document.addEventListener("mousedown", onMouseDown);
      rootRef.current?.addEventListener("scroll", placeMenu);
      window.addEventListener("resize", placeMenu);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      window.addEventListener("keydown", onKeyDown);

      return () => {
        menuRef.current?.style.setProperty("display", "none");
        menuRef.current?.style.removeProperty("left");
        menuRef.current?.style.removeProperty("top");
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
          style={{ display: "none", position: "fixed", zIndex: zIndexes.taskMenu }}
        >
          {taskMenu && <TaskMenuDropdown {...taskMenu} onClose={onClose} />}
        </div>
      </Portal>
    </TaskMenuContext.Provider>
  );
};
