import {
  addInternalEventsListener,
  emitInternalEvent,
  InternalEvent,
  removeInternalEventsListner,
} from "@/hooks/use-internal-event";
import { useEffect, useState } from "react";
import { TaskDataFragment } from "../../queries/fragmentTask.graphql";
import { TaskMenu, TaskMenuContextType } from "./task-menu-types";

export function setTaskMenuRoot(root: HTMLElement | null) {
  emitInternalEvent(InternalEvent.TASK_MENU_SET_ROOT, { root });
}

export const useTaskMenu: (task: TaskDataFragment) => TaskMenuContextType = (task) => {
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    if (isOpened) {
      const onClosed = () => setIsOpened(false);

      addInternalEventsListener(InternalEvent.TASK_MENU_CLOSE, onClosed);

      return () => {
        removeInternalEventsListner(InternalEvent.TASK_MENU_CLOSE, onClosed);
      };
    } else {
      const onOpened = (event: unknown) => {
        const { menu } = event as { menu: TaskMenu };
        if (menu.task._id === task._id) {
          setIsOpened(true);
        }
      };

      addInternalEventsListener(InternalEvent.TASK_MENU_OPEN, onOpened);

      return () => {
        removeInternalEventsListner(InternalEvent.TASK_MENU_OPEN, onOpened);
      };
    }
  }, [isOpened, task._id]);

  return {
    open(menu) {
      emitInternalEvent(InternalEvent.TASK_MENU_OPEN, { menu: { ...menu, task } });
    },
    close() {
      emitInternalEvent(InternalEvent.TASK_MENU_CLOSE);
    },
    isOpened,
  };
};
