"use client";

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
import { UpdateTask } from "../../hooks/use-update-tasks";

export function setTaskMenuRoot(root: HTMLElement | null) {
  emitInternalEvent(InternalEvent.TASK_MENU_SET_ROOT, { root });
}

export const useTaskMenu: (args: {
  task?: TaskDataFragment;
  groupVariables: TasksQueryVariables | null;
  updateTask?: (task: UpdateTask) => Promise<void>;
  zIndex?: number;
}) => TaskMenuContextType = ({ task, groupVariables, zIndex, updateTask }) => {
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
        if (menu.task._id === task?._id) {
          setActivatedAction(menu.action);
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
      if (!task) return;

      emitInternalEvent(InternalEvent.TASK_MENU_OPEN, {
        menu: { ...menu, task, groupVariables, zIndex, updateTask },
      });
    },
    close() {
      emitInternalEvent(InternalEvent.TASK_MENU_CLOSE);
    },
    isOpened: !!activatedAction,
    activatedAction,
  };
};
