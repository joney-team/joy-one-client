"use client";

import { ContextMenuDropdownComponent } from "@/components/context-menu/context-menu-types";
import { Card } from "@mantine/core";
import { useMemo } from "react";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { TaskMenuAssignee } from "./task-menu-assignee";
import { TaskMenuCustomer } from "./task-menu-customer";
import { TaskMenuEstimateTime } from "./task-menu-estimate-time";
import { TaskMenuGanttTimeline } from "./task-menu-gantt-timeline";
import { TaskMenuPriority } from "./task-menu-priority";
import { TaskMenuStatus } from "./task-menu-status";
import { TaskMenuTags } from "./task-menu-tags";
import { TaskMenuTimeline } from "./task-menu-timeline";
import {
  TaskMenuAction,
  TaskMenuComponent,
  TaskMenuContext,
  TaskMenuData,
} from "./task-menu-types";

const menuComponents: Record<TaskMenuAction, TaskMenuComponent> = {
  [TaskMenuAction.CHANGE_PRIORITY]: TaskMenuPriority,
  [TaskMenuAction.CHANGE_TIMELINE]: TaskMenuTimeline,
  [TaskMenuAction.GANTT_TIMELINE]: TaskMenuGanttTimeline,
  [TaskMenuAction.CHANGE_STATUS]: TaskMenuStatus,
  [TaskMenuAction.CHANGE_TAGS]: TaskMenuTags,
  [TaskMenuAction.CHANGE_ASSIGNEE]: TaskMenuAssignee,
  [TaskMenuAction.CHANGE_CUSTOMER]: TaskMenuCustomer,
  [TaskMenuAction.CHANGE_ESTIMATE_TIME]: TaskMenuEstimateTime,
};

export const TaskContextMenuDropdown: ContextMenuDropdownComponent = (props) => {
  const task = props.data as TaskMenuData;
  const context = props.context as TaskMenuContext;
  const { updateTasks } = useUpdateTasks();

  const DropdownMenu = useMemo(() => {
    return menuComponents[context.action];
  }, [context.action]);

  if (!DropdownMenu) throw Error("DropdownMenu not found");

  return (
    <Card p={0} shadow="md" withBorder>
      <DropdownMenu
        key={task._id}
        {...context}
        task={task}
        onClose={props.onClose}
        updateTask={(taskData) => {
          if (context.updateTask) {
            return context.updateTask(taskData);
          }

          return updateTasks(taskData);
        }}
        setClickOutsideToClose={(enabled) => {
          props.setClickOutsideToClose(enabled);
        }}
      />
    </Card>
  );
};
