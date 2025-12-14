"use client";

import { useContextMenu } from "@/components/context-menu/context-menu";
import type { PlaceDropdownMenuOptions } from "@/components/context-menu/context-menu-helpers";
import {
  addInternalEventsListener,
  emitInternalEvent,
  InternalEvent,
  removeInternalEventsListner,
} from "@/hooks/use-internal-event";
import { useEffect, useState } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import type { TasksQueryVariables } from "../../graphql/queryTasks.graphql";
import type { UpdateTask } from "../../hooks/use-update-tasks";
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
    groupVariables: TasksQueryVariables | null;
    task?: TaskMenuData;
    options?: PlaceDropdownMenuOptions;
    updateTask?: (task: UpdateTask) => Promise<void>;
    onClose?: () => void;
  } & Partial<TaskMenuContext>
) => TaskMenuContextType = ({
  task,
  options: defaultOptions,
  groupVariables: defaultGroupVariables,
  updateTask: defaultUpdateTask,
  onClose: defaultOnClose,
}) => {
  const contextMenu = useContextMenu<Partial<TaskDataFragment> & { _id: string }>();
  const [activatedAction, setActivatedAction] = useState<TaskMenuAction | null>(null);

  useEffect(() => {
    if (activatedAction) {
      const onClosed = () => {
        setActivatedAction(null);
      };

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

      const mainContext: TaskMenuContext = {
        action: menu.action,
        groupVariables: defaultGroupVariables,
        updateTask: menu.updateTask ?? defaultUpdateTask,
      };

      contextMenu.open({
        data: pointedTask,
        context: mainContext,
        target: menu.target,
        options: {
          ...defaultOptions,
          ...menu.options,
        },
        onClose: () => {
          emitInternalEvent(InternalEvent.TASK_MENU_CLOSE);
          defaultOnClose?.();
          menu.onClose?.();
        },
      });

      emitInternalEvent(InternalEvent.TASK_MENU_OPEN, {
        taskId: pointedTask._id,
        action: menu.action,
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
