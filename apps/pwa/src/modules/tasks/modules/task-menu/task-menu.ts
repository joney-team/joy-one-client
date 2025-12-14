"use client";

import { useContextMenu } from "@/components/context-menu/context-menu";
import {
  addInternalEventsListener,
  emitInternalEvent,
  InternalEvent,
  removeInternalEventsListner,
} from "@/hooks/use-internal-event";
import { useEffect, useState } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import {
  TaskMenuAction,
  TaskMenuContext,
  TaskMenuContextType,
  TaskMenuData,
} from "./task-menu-types";

export function setTaskMenuRoot(root: HTMLElement | null) {
  emitInternalEvent(InternalEvent.TASK_MENU_SET_ROOT, { root });
}

export const useTaskMenu: (
  args: {
    task?: TaskMenuData;
  } & Partial<TaskMenuContext>
) => TaskMenuContextType = ({ task, ...context }) => {
  const contextMenu = useContextMenu<Partial<TaskDataFragment> & { _id: string }>();
  const [activatedAction, setActivatedAction] = useState<TaskMenuAction | null>(null);

  useEffect(() => {
    if (activatedAction) {
      const onClosed = () => setActivatedAction(null);

      addInternalEventsListener(InternalEvent.TASK_MENU_CLOSE, onClosed);

      return () => {
        removeInternalEventsListner(InternalEvent.TASK_MENU_CLOSE, onClosed);
      };
    } else {
      const onOpened = (event: unknown) => {
        const { taskId, action } = event as { taskId: string; action: TaskMenuAction };
        if (taskId === task?._id) {
          setActivatedAction(action);
        }
      };

      addInternalEventsListener(InternalEvent.TASK_MENU_OPEN, onOpened);

      return () => {
        removeInternalEventsListner(InternalEvent.TASK_MENU_OPEN, onOpened);
      };
    }
  }, [activatedAction, task?._id]);

  return {
    open(menu) {
      const pointedTask = menu.task ?? task;
      if (!pointedTask) return;

      contextMenu.open({
        data: pointedTask,
        context: {
          ...context,
          ...menu,
        },
        onClose: () => {
          emitInternalEvent(InternalEvent.TASK_MENU_CLOSE);
        },
        target: menu.target,
        offset: menu.offset,
      });

      emitInternalEvent(InternalEvent.TASK_MENU_OPEN, {
        menu: { taskId: pointedTask._id, action: menu.action },
      });
    },
    close() {
      if (activatedAction !== null) setActivatedAction(null);
      contextMenu.close();
    },
    isOpened: !!activatedAction,
    activatedAction,
  };
};
