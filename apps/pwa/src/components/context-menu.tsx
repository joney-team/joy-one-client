"use client";

import type { MenuProps, MenuTargetProps, PopoverStylesNames } from "@mantine/core";
import { createEventHandler, createSafeContext, isElement, Menu } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import React, { cloneElement, forwardRef, useRef } from "react";

export type TriggerEvent = "click" | "context";

interface ContextMenuContext {
  lastEventRef: React.MutableRefObject<React.MouseEvent | null>;
  toggleDropdown(e: React.MouseEvent): void;
  trigger?: TriggerEvent;
}

export const [ContextMenuProvider, useContextMenuContext] = createSafeContext<ContextMenuContext>(
  "ContextMenuContext is undefined"
);

interface RefWrapperProps extends React.PropsWithChildren<{ refProp: string }> {}

/** ref wrapper, append custom floating middleware to move dropdown follow mouse click */
const RefWrapper = forwardRef<HTMLElement, RefWrapperProps>((props, ref) => {
  const { children, refProp, ...others } = props;

  if (!isElement(children)) {
    throw new Error(
      "ContextMenu.Target component children should be an element or a component that accepts ref"
    );
  }

  // TypeScript doesn't narrow the type after isElement check, so we assert it
  const childElement = children as React.ReactElement<any>;
  const ctx = useContextMenuContext();

  const toggleDropdown = (e: React.MouseEvent) => {
    // ref of trigger should be an function
    if (typeof ref === "function") {
      ref({
        getBoundingClientRect() {
          return {
            x: e.clientX,
            y: e.clientY,
            width: 0,
            height: 0,
            top: e.clientY,
            right: e.clientX,
            bottom: e.clientY,
            left: e.clientX,
          };
        },
      } as any);
      ctx.toggleDropdown(e);
    }
  };

  const onContextMenu = createEventHandler(childElement.props.onContextMenu, (e) => {
    if (ctx.trigger === "context") {
      (e as React.MouseEvent).preventDefault();
      toggleDropdown(e as React.MouseEvent);
    }
  });

  const onClick = createEventHandler(childElement.props.onClick, (e) => {
    if (ctx.trigger === "click") {
      toggleDropdown(e as React.MouseEvent);
    }
  });

  return cloneElement(childElement, {
    ...others,
    onClick,
    onContextMenu,
    [refProp]: ref,
  } as any);
});

RefWrapper.displayName = "RefWrapper";

export const ContextMenuTarget = forwardRef<HTMLElement, MenuTargetProps>((props, ref) => {
  const { children, refProp = "ref", ...others } = props;
  return (
    <Menu.Target {...others} refProp={refProp} ref={ref}>
      <RefWrapper refProp={refProp}>{children}</RefWrapper>
    </Menu.Target>
  );
});

ContextMenuTarget.displayName = "ContextMenuTarget";

export type ContextMenuStylesNames = PopoverStylesNames;

export interface ContextMenuProps extends Omit<MenuProps, "trigger" | "onOpen"> {
  trigger?: TriggerEvent;
  onOpen?: (e: React.MouseEvent) => void;
  dataPointed?: {
    attributeName: string;
    onPointed: (id: string | null) => void;
  };
}

/**
 * ContextMenu, Menu Wrapper make the menu(dropdown) follow the mouse click
 *
 * @example
 * ```tsx
 * <ContextMenu position='top-end'>
 *  <ContextMenu.Target>
 *    <Center h={100} bg='teal'>
 *      Right Click
 *    </Center>
 *  </ContextMenu.Target>
 *  <ContextMenu.Dropdown>
 *    <ContextMenu.Item>Undo</ContextMenu.Item>
 *    <ContextMenu.Item>Redo</ContextMenu.Item>
 *  </ContextMenu.Dropdown>
 * </ContextMenu>
 * ```
 */
export const ContextMenu = (props: ContextMenuProps) => {
  const {
    opened,
    defaultOpened,
    onChange,
    onOpen,
    onClose,
    children,
    trigger = "context",
    position = "bottom-start",
    dataPointed,
    ...others
  } = props;

  // controlled menu opened state
  const [_opened, setOpened] = useUncontrolled({
    value: opened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange,
  });

  const close = () => {
    setOpened(false);
    _opened && onClose?.();
  };

  const open = (e: React.MouseEvent) => {
    setOpened(true);
    !_opened && onOpen?.(e);
  };

  const lastEventRef = useRef<React.MouseEvent | null>(null);
  const toggleDropdown = (e: React.MouseEvent) => {
    lastEventRef.current = e;
    _opened ? close() : open(e);

    if (dataPointed) {
      const closestElement = (e.target as HTMLElement).closest(`[${dataPointed.attributeName}]`);
      const id = closestElement?.getAttribute(dataPointed.attributeName);
      dataPointed.onPointed(id ?? null);
    }
  };

  const ctx = {
    toggleDropdown,
    trigger,
    lastEventRef,
  };

  return (
    <ContextMenuProvider value={ctx}>
      <Menu
        {...others}
        trigger={trigger === "context" ? undefined : trigger}
        opened={_opened}
        onChange={(e) => {
          setOpened(e);
          if (!e) onClose?.();
        }}
        defaultOpened={defaultOpened}
        position={position}
      >
        {children}
      </Menu>
    </ContextMenuProvider>
  );
};

ContextMenu.Target = ContextMenuTarget;
ContextMenu.Dropdown = Menu.Dropdown;
ContextMenu.Label = Menu.Label;
ContextMenu.Item = Menu.Item;
ContextMenu.Divider = Menu.Divider;
