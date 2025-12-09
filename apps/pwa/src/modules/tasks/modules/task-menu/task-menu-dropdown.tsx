"use client";

import { Portal, Skeleton } from "@mantine/core";
import { ComponentType, useEffect, useMemo, useRef, useState, type FC } from "react";
import { TaskMenuAction, TaskMenuComponentProps, type TaskMenu } from "./task-menu-types";

import {
  addInternalEventsListener,
  emitInternalEvent,
  InternalEvent,
  removeInternalEventsListner,
} from "@/hooks/use-internal-event";
import { classNames } from "@/utils/ui.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import dynamic from "next/dynamic";
import styles from "./task-menu.module.css";
import { useUpdateTasks } from "../../hooks/use-update-tasks";

const TaskMenuEstimateTime = dynamic(
  () => import("./task-menu-estimate-time").then((mod) => mod.TaskMenuEstimateTime),
  {
    ssr: false,
    loading: () => <Skeleton w={130} h={200} />,
  }
);

const TaskMenuCustomer = dynamic(
  () => import("./task-menu-customer").then((mod) => mod.TaskMenuCustomer),
  {
    ssr: false,
    loading: () => <Skeleton w={130} h={200} />,
  }
);

const TaskMenuPriority = dynamic(
  () => import("./task-menu-priority").then((mod) => mod.TaskMenuPriority),
  {
    ssr: false,
    loading: () => <Skeleton w={130} h={200} />,
  }
);

const TaskMenuTimeline = dynamic(
  () => import("./task-menu-timeline").then((mod) => mod.TaskMenuTimeline),
  {
    ssr: false,
    loading: () => <Skeleton w={480} h={400} />,
  }
);

const TaskMenuGanttTimeline = dynamic(
  () => import("./task-menu-gantt-timeline").then((mod) => mod.TaskMenuGanttTimeline),
  {
    ssr: false,
    loading: () => <Skeleton w={130} h={75} />,
  }
);

const TaskMenuStatus = dynamic(
  () => import("./task-menu-status").then((mod) => mod.TaskMenuStatus),
  {
    ssr: false,
    loading: () => <Skeleton w={170} h={200} />,
  }
);

const TaskMenuTags = dynamic(() => import("./task-menu-tags").then((mod) => mod.TaskMenuTags), {
  ssr: false,
  loading: () => <Skeleton w={130} h={200} />,
});

const TaskMenuAssignee = dynamic(
  () => import("./task-menu-assignee").then((mod) => mod.TaskMenuAssignee),
  {
    ssr: false,
    loading: () => <Skeleton w={130} h={75} />,
  }
);

const menuComponents: Partial<Record<TaskMenuAction, ComponentType<TaskMenuComponentProps>>> = {
  [TaskMenuAction.CHANGE_PRIORITY]: TaskMenuPriority,
  [TaskMenuAction.CHANGE_TIMELINE]: TaskMenuTimeline,
  [TaskMenuAction.GANTT_TIMELINE]: TaskMenuGanttTimeline,
  [TaskMenuAction.CHANGE_STATUS]: TaskMenuStatus,
  [TaskMenuAction.CHANGE_TAGS]: TaskMenuTags,
  [TaskMenuAction.CHANGE_ASSIGNEE]: TaskMenuAssignee,
  [TaskMenuAction.CHANGE_CUSTOMER]: TaskMenuCustomer,
  [TaskMenuAction.CHANGE_ESTIMATE_TIME]: TaskMenuEstimateTime,
};

export const TaskMenuDropdown: FC = ({}) => {
  const [taskMenu, setTaskMenu] = useState<TaskMenu>();
  const { updateTasks } = useUpdateTasks();

  const menuRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const clickOutsideToCloseEnabled = useRef(true);

  const onClose = () => {
    if (menuRef.current) {
      menuRef.current.classList.remove(styles.AnimatedIn);
      menuRef.current?.style.setProperty("display", "none");
      menuRef.current?.style.removeProperty("left");
      menuRef.current?.style.removeProperty("top");
      menuRef.current?.classList.remove(styles.AnimatedOut);
    }

    setTaskMenu(undefined);
    emitInternalEvent(InternalEvent.TASK_MENU_CLOSE);
  };

  useEffect(() => {
    if (taskMenu && menuRef.current) {
      const placeMenu = () => {
        if (!menuRef.current) return;

        const targetRect = taskMenu.target.getBoundingClientRect();

        // Get menu dimensions - use offsetWidth/offsetHeight as fallback for more reliable measurement
        const menuRect = menuRef.current.getBoundingClientRect();
        const menuWidth = menuRect.width || menuRef.current.offsetWidth || 0;
        const menuHeight = menuRect.height || menuRef.current.offsetHeight || 0;

        // If menu has no dimensions yet, skip positioning
        if (menuWidth === 0 || menuHeight === 0) {
          // Retry on next frame if dimensions aren't ready
          requestAnimationFrame(placeMenu);
          return;
        }

        // Viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Padding from viewport edges
        const padding = 16;

        // Default offset values
        const offsetX = taskMenu.offset?.x ?? 0;
        const offsetY = taskMenu.offset?.y ?? 0;

        // Calculate initial position (below target by default)
        let placeX = targetRect.x + offsetX;
        let placeY = targetRect.y + targetRect.height + offsetY;

        // Check if menu overflows bottom of viewport
        const wouldOverflowBottom = placeY + menuHeight + padding > viewportHeight;
        // Check if menu overflows top of viewport (when flipped)
        const wouldOverflowTop = placeY - menuHeight - padding < 0;

        // Vertical positioning: prefer bottom, flip to top if needed
        if (wouldOverflowBottom && !wouldOverflowTop) {
          // Flip to top
          placeY = targetRect.y - menuHeight - offsetY;
        } else if (wouldOverflowBottom && wouldOverflowTop) {
          // If both overflow, choose the side with more space
          const spaceBelow = viewportHeight - (targetRect.y + targetRect.height);
          const spaceAbove = targetRect.y;

          if (spaceAbove > spaceBelow) {
            placeY = targetRect.y - menuHeight - offsetY;
          } else {
            // Keep bottom but clamp to viewport
            placeY = viewportHeight - menuHeight - padding;
          }
        }

        // Horizontal positioning: adjust to prevent overflow
        const wouldOverflowRight = placeX + menuWidth + padding > viewportWidth;
        const wouldOverflowLeft = placeX - padding < 0;

        if (wouldOverflowRight && !wouldOverflowLeft) {
          // Shift left to fit
          placeX = viewportWidth - menuWidth - padding;
        } else if (wouldOverflowLeft && !wouldOverflowRight) {
          // Shift right to fit
          placeX = padding;
        } else if (wouldOverflowRight && wouldOverflowLeft) {
          // If menu is wider than viewport, center it
          placeX = Math.max(padding, (viewportWidth - menuWidth) / 2);
        }

        // Ensure position is within viewport bounds
        placeX = Math.max(padding, Math.min(placeX, viewportWidth - menuWidth - padding));
        placeY = Math.max(padding, Math.min(placeY, viewportHeight - menuHeight - padding));

        menuRef.current.style.setProperty("left", `${placeX}px`);
        menuRef.current.style.setProperty("top", `${placeY}px`);
      };

      // Make menu visible and trigger animation
      menuRef.current.style.setProperty("display", "block");
      // Use requestAnimationFrame to ensure the display change is applied before animation
      requestAnimationFrame(() => {
        menuRef.current?.classList.add(styles.AnimatedIn);
        placeMenu();
      });

      // Click outside of menu to close
      const onMouseDown = (e: MouseEvent) => {
        if (
          clickOutsideToCloseEnabled.current &&
          e.target &&
          !menuRef.current?.contains(e.target as Node) &&
          !taskMenu.target.contains(e.target as Node)
        ) {
          onClose();
        }
      };

      // Escape key to close
      const onWindowKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          e.preventDefault();
        }
      };

      window.addEventListener("resize", placeMenu);

      rootRef.current?.addEventListener("scroll", onClose);
      window.addEventListener("scroll", onClose);

      document.addEventListener("mousedown", onMouseDown);
      window.addEventListener("keydown", onWindowKeyDown);

      const observer = new ResizeObserver(placeMenu);
      observer.observe(menuRef.current);

      return () => {
        onClose();
        window.removeEventListener("resize", placeMenu);

        rootRef.current?.removeEventListener("scroll", onClose);
        window.removeEventListener("scroll", onClose);

        document.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("keydown", onWindowKeyDown);

        observer.disconnect();
      };
    }
  }, [menuRef.current, taskMenu, onClose]);

  useEffect(() => {
    const onMenuOpen = (event: unknown) => {
      const { menu } = event as { menu: TaskMenu };
      if (taskMenu && menu.task._id === taskMenu.task._id && menu.action === taskMenu.action) {
        return onClose();
      }

      setTaskMenu(menu);
    };

    const onMenuSetRoot = (event: unknown) => {
      const { root } = event as { root: HTMLElement };
      rootRef.current = root;
    };

    addInternalEventsListener(InternalEvent.TASK_MENU_OPEN, onMenuOpen);
    addInternalEventsListener(InternalEvent.TASK_MENU_SET_ROOT, onMenuSetRoot);

    return () => {
      removeInternalEventsListner(InternalEvent.TASK_MENU_OPEN, onMenuOpen);
      removeInternalEventsListner(InternalEvent.TASK_MENU_SET_ROOT, onMenuSetRoot);
    };
  }, [taskMenu, onClose]);

  const DropdownMenu = useMemo(() => {
    if (!taskMenu) return null;
    return menuComponents[taskMenu.action];
  }, [taskMenu]);

  return (
    <Portal>
      <div
        ref={menuRef}
        className={classNames(styles.TaskMenu, styles.TaskMenuDropdown)}
        style={{
          display: "none",
          position: "fixed",
          zIndex: taskMenu?.zIndex ?? zIndexes.taskMenu,
        }}
      >
        {taskMenu && DropdownMenu ? (
          <DropdownMenu
            key={taskMenu.task._id}
            {...taskMenu}
            onClose={onClose}
            updateTask={(task) => {
              if (taskMenu.updateTask) {
                return taskMenu.updateTask(task);
              }

              return updateTasks(task);
            }}
            setClickOutsideToClose={(enabled) => {
              clickOutsideToCloseEnabled.current = enabled;
            }}
          />
        ) : null}
      </div>
    </Portal>
  );
};
