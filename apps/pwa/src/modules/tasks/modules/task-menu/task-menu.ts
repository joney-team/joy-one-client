import {
  addInternalEventsListener,
  emitInternalEvent,
  InternalEvent,
  removeInternalEventsListner,
} from "@/hooks/use-internal-event";
import { useEffect, useState } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import { TaskMenu, TaskMenuAction, TaskMenuContextType } from "./task-menu-types";
import { TasksQueryVariables } from "../../graphql/queryTasks.graphql";

export function setTaskMenuRoot(root: HTMLElement | null) {
  emitInternalEvent(InternalEvent.TASK_MENU_SET_ROOT, { root });
}

export const useTaskMenu: (
  task: TaskDataFragment,
  groupVariables: TasksQueryVariables | null
) => TaskMenuContextType = (task, groupVariables) => {
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
        const { menu } = event as { menu: TaskMenu };
        if (menu.task._id === task._id) {
          setActivatedAction(menu.action);
        }
      };

      addInternalEventsListener(InternalEvent.TASK_MENU_OPEN, onOpened);

      return () => {
        removeInternalEventsListner(InternalEvent.TASK_MENU_OPEN, onOpened);
      };
    }
  }, [activatedAction, task._id]);

  return {
    open(menu) {
      emitInternalEvent(InternalEvent.TASK_MENU_OPEN, { menu: { ...menu, task, groupVariables } });
    },
    close() {
      emitInternalEvent(InternalEvent.TASK_MENU_CLOSE);
    },
    isOpened: !!activatedAction,
    activatedAction,
  };
};
