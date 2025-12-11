"use client";

import { TaskStatus } from "@/graphql/types.graphql";
import { useTaskStatuses } from "@/modules/tasks/hooks/use-task-statuses";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { DateTime } from "@joy-one-client/utils/date-time";
import {
  createContext,
  FC,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { type TasksQueryVariables } from "../../../graphql/queryTasks.graphql";
import { ganttConfig } from "../gantt-tasks-config";
import { useGantt } from "../gantt-tasks-context";
import type { GanttTaskProps, GanttTaskTimeline } from "./gantt-task-types";
import { useColor } from "@/modules/theme/use-color";

type GanttTaskRowRefs = {
  rootRef: RefObject<HTMLDivElement | null>;
  ganttTaskAreaRef: RefObject<HTMLDivElement | null>;

  taskStatus: TaskStatus;
  subTasksGroupVariables: TasksQueryVariables;
  timeline: GanttTaskTimeline | null;
} & GanttTaskProps;

const Context = createContext({} as GanttTaskRowRefs);

export const GanttTaskRowProvider: FC<GanttTaskProps & { children: ReactNode }> = ({
  children,
  task,
  ...props
}) => {
  const gantt = useGantt();
  const color = useColor();
  const rootRef = useRef<HTMLDivElement>(null);
  const ganttTaskAreaRef = useRef<HTMLDivElement>(null);

  const subTasksGroupVariables = useMemo<TasksQueryVariables>(() => {
    return {
      parentId: task._id,
      all: true,
    };
  }, [task._id]);

  const timeline = useMemo<GanttTaskTimeline | null>(() => {
    const rawStartDate = task.childTimeline?.startDate ?? task.startDate ?? task.createdAt;
    const rawDueDate = task.childTimeline?.dueDate ?? task.dueDate;

    if (rawStartDate && rawDueDate) {
      const startDate = DateTime.toSeconds(rawStartDate);
      const dueDate = DateTime.toSeconds(rawDueDate);

      const startIndexCaptured = gantt.columns.findIndex(
        (column) =>
          DateTime.toSeconds(column.start) >= startDate ||
          DateTime.toSeconds(column.end) >= startDate
      );

      const startIndex = startIndexCaptured >= 0 ? startIndexCaptured : 0;

      const endIndexCaptured = gantt.columns.findIndex(
        (column) =>
          DateTime.toSeconds(column.end) >= dueDate || DateTime.toSeconds(column.start) >= dueDate
      );

      const endIndex = endIndexCaptured >= 0 ? endIndexCaptured : gantt.columns.length - 1;

      return {
        startIndex,
        endIndex,
        left: startIndex * ganttConfig.columnSize,
        width: (endIndex - startIndex + 1) * ganttConfig.columnSize,
        isChildSummary: !!task.childTimeline?.startDate && !!task.childTimeline?.dueDate,
        isCanMove: !gantt.isGrabbing,
        startDate,
        dueDate,
      };
    }

    return null;
  }, [task.startDate, task.dueDate, task.childTimeline, gantt.columns, gantt.isGrabbing]);

  useEffect(() => {
    const hoverRow = () => {
      rootRef.current?.setAttribute("hovered", "true");
      ganttTaskAreaRef.current?.setAttribute("hovered", "true");
    };

    const leaveRow = () => {
      rootRef.current?.removeAttribute("hovered");
      ganttTaskAreaRef.current?.removeAttribute("hovered");
    };

    rootRef.current?.addEventListener("mouseenter", hoverRow);
    rootRef.current?.addEventListener("mouseleave", leaveRow);

    ganttTaskAreaRef.current?.addEventListener("mouseenter", hoverRow);
    ganttTaskAreaRef.current?.addEventListener("mouseleave", leaveRow);

    return () => {
      rootRef.current?.removeEventListener("mouseenter", hoverRow);
      rootRef.current?.removeEventListener("mouseleave", leaveRow);

      ganttTaskAreaRef.current?.removeEventListener("mouseenter", hoverRow);
      ganttTaskAreaRef.current?.removeEventListener("mouseleave", leaveRow);
    };
  }, [ganttTaskAreaRef.current, rootRef.current]);

  const { status } = useTaskStatuses(task);

  useEffect(() => {
    rootRef.current?.style.setProperty("--task-status-color", color(status?.color ?? "gray"));
  }, [status, color]);

  return (
    <Context.Provider
      value={{
        rootRef,
        ganttTaskAreaRef,
        subTasksGroupVariables,
        task,
        timeline,
        taskStatus: status ?? { id: DefaultTaskStatusId.TODO, name: "", color: "gray", order: 0 },
        ...props,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useGanttTaskRow = () => {
  return useContext(Context);
};
