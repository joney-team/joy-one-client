"use client";

import { useEscape } from "@/hooks/use-escape";
import { useEffect, useRef, useState } from "react";
import { useContextMenu } from "./context-menu";
import { ContextMenuProps } from "./context-menu-types";

import { placeDropdownMenu } from "./context-menu-helpers";
import { getId } from "@joy-one-client/utils/base-data";

export const ContextMenuDropdown = ({
  id,
  dropdown: Dropdown,
  onClose,
  root,
}: Pick<ContextMenuProps, "dropdown" | "root"> & { onClose: () => void; id: string }) => {
  const [menuId, setMenuId] = useState<string | null>(null);
  const { menuRef, close, menuArgsRef } = useContextMenu();
  const clickOutsideToCloseEnabled = useRef(true);

  // Close the menu when the escape key is pressed
  useEscape({
    id: `${menuId}-${id ?? "context-menu"}`,
    onEscape: close,
    active: !!menuId,
  });

  // Update the opened state when the menu is opened or closed
  useEffect(() => {
    if (!menuRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          menuRef.current &&
          mutation.type === "attributes" &&
          mutation.attributeName === "data-opened"
        ) {
          const newValue = menuRef.current.getAttribute("data-opened");
          setMenuId(
            newValue === "true" && menuArgsRef.current ? getId(menuArgsRef.current?.data) : null
          );
        }
      });
    });

    observer.observe(menuRef.current, {
      attributes: true,
      attributeFilter: ["data-opened"],
    });

    return () => {
      observer.disconnect();
    };
  }, [menuRef.current]);

  // Place the menu and handle click outside to close
  useEffect(() => {
    if (!menuArgsRef.current || !menuRef.current) return;

    const placeMenu = () => {
      if (!menuRef.current || !menuArgsRef.current) return;
      placeDropdownMenu({ ...menuArgsRef.current, menu: menuRef.current });
    };

    // Use requestAnimationFrame to ensure the display change is applied before animation
    requestAnimationFrame(() => {
      if (!menuRef.current || !menuArgsRef.current) return;
      placeMenu();
    });

    // Click outside of menu to close
    const onMouseDown = (e: MouseEvent) => {
      if (!menuArgsRef.current || !menuRef.current) return;
      if (
        clickOutsideToCloseEnabled.current &&
        e.target &&
        !menuRef.current.contains(e.target as Node) &&
        !menuArgsRef.current.target.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", onClose);
    root?.current?.addEventListener("scroll", onClose);
    document.addEventListener("mousedown", onMouseDown);

    const observer = new ResizeObserver(placeMenu);
    observer.observe(menuRef.current);

    return () => {
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", onClose);
      root?.current?.removeEventListener("scroll", onClose);
      document.removeEventListener("mousedown", onMouseDown);

      observer.disconnect();
    };
  }, [menuId]);

  if (!menuId || !menuArgsRef.current) return null;

  return (
    <Dropdown
      key={getId(menuArgsRef.current.data)}
      data={menuArgsRef.current.data}
      context={menuArgsRef.current.context}
      onClose={close}
      setClickOutsideToClose={(value) => {
        clickOutsideToCloseEnabled.current = value;
      }}
    />
  );
};
