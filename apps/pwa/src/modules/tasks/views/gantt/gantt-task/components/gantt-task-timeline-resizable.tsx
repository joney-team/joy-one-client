"use client";

import { Group } from "@mantine/core";
import { IconChevronCompactRight } from "@tabler/icons-react";
import { FC, ReactNode, RefObject, useEffect, useRef } from "react";

import { useApolloClient } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { IconChevronCompactLeft } from "@tabler/icons-react";
import { UpdateTask, useUpdateTasks } from "../../../../hooks/use-update-tasks";
import QUERY_TASKS, {
  type TasksQuery,
  type TasksQueryVariables,
} from "../../../../queries/queryTasks.graphql";
import { ganttConfig } from "../../gantt-tasks-config";
import { useGantt } from "../../gantt-tasks-context";
import styles from "../../gantt-tasks.module.css";
import { useGanttTaskRow } from "../gantt-task-provider";

export const GanttTaskTimelineResizable: FC<{
  children: ReactNode;
  timelineRef: RefObject<HTMLDivElement | null>;
}> = ({ children, timelineRef }) => {
  const gantt = useGantt();
  const client = useApolloClient();
  const { ganttTaskAreaRef, timeline, subTasksGroupVariables, task } = useGanttTaskRow();
  const { updateTasks } = useUpdateTasks();

  // Resize pointers
  const resizeLeftPointerRef = useRef<HTMLDivElement>(null);
  const resizeRightPointerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const estimatedRange = timelineRef.current;
    if (!timeline || !estimatedRange || !ganttTaskAreaRef.current) return;

    let resizingDirection: "LEFT" | "RIGHT" | null = null;
    let resizing = false;
    let initialX = 0;
    let initialLeft = timeline.left;
    let initialWidth = timeline.width;
    let initialStartIndex = timeline.startIndex;
    let initialEndIndex = timeline.endIndex;

    const resetResize = () => {
      if (!estimatedRange) return;
      estimatedRange.style.setProperty("left", `${timeline.left}px`);
      estimatedRange.style.setProperty("width", `${timeline.width}px`);
      resizing = false;
      resizingDirection = null;
    };

    const onMouseDown = (direction: "LEFT" | "RIGHT") => {
      return (e: MouseEvent) => {
        if (!timeline || !estimatedRange || !ganttTaskAreaRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        resizingDirection = direction;
        resizing = true;
        initialX = e.pageX;
        initialLeft = timeline.left;
        initialWidth = timeline.width;
        initialStartIndex = timeline.startIndex;
        initialEndIndex = timeline.endIndex;
      };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!resizing || !resizingDirection || !estimatedRange || !timeline) return;

      const distance = e.pageX - initialX;

      if (resizingDirection === "LEFT") {
        // Resizing left edge
        const newLeft = Math.max(0, initialLeft + distance);
        const newWidth = initialWidth - distance;

        // Ensure minimum width
        if (newWidth < ganttConfig.columnSize) return;

        estimatedRange.style.setProperty("left", `${newLeft}px`);
        estimatedRange.style.setProperty("width", `${newWidth}px`);
      } else if (resizingDirection === "RIGHT") {
        // Resizing right edge
        const newWidth = initialWidth + distance;

        // Ensure minimum width
        if (newWidth < ganttConfig.columnSize) return;

        // Ensure we don't go beyond the timeline
        const maxWidth = gantt.columns.length * ganttConfig.columnSize - initialLeft;
        const clampedWidth = Math.min(newWidth, maxWidth);

        estimatedRange.style.setProperty("width", `${clampedWidth}px`);
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!resizing || !resizingDirection || !timeline || !estimatedRange) {
        resetResize();
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const distance = e.pageX - initialX;
      const rect = ganttTaskAreaRef.current?.getBoundingClientRect();
      if (!rect) {
        resetResize();
        return;
      }

      const subtasksData = client.cache.readQuery<TasksQuery, TasksQueryVariables>({
        query: QUERY_TASKS,
        variables: subTasksGroupVariables,
      });

      const subtasks = Array.from(subtasksData?.tasks.data ?? []);

      if (resizingDirection === "LEFT") {
        // Calculate new start index (keep end index fixed)
        const newLeft = Math.max(0, initialLeft + distance);
        const newStartIndex = Math.max(0, Math.floor(newLeft / ganttConfig.columnSize));

        // Ensure start index doesn't exceed end index
        if (newStartIndex >= initialEndIndex) {
          resetResize();
          return;
        }

        const startColumn = gantt.columns[newStartIndex];
        const endColumn = gantt.columns[initialEndIndex];

        if (!startColumn || !endColumn) {
          resetResize();
          return;
        }

        if (timeline.isChildSummary) {
          const oneDay = 86400;
          const distanceIndex = newStartIndex - initialStartIndex;
          const distanceTime = distanceIndex * oneDay;

          updateTasks(
            subtasks.reduce<UpdateTask[]>((acc, subtask) => {
              if (subtask.startDate && subtask.dueDate) {
                acc.push({
                  _id: subtask._id,
                  startDate: subtask.startDate + distanceTime,
                  dueDate: subtask.dueDate,
                });
              }
              return acc;
            }, [])
          );
        } else {
          const startDate = DateTime.toSeconds(startColumn.start);
          const endDate = DateTime.toSeconds(endColumn.end);

          updateTasks({
            _id: task._id,
            startDate,
            dueDate: endDate,
          });
        }
      } else if (resizingDirection === "RIGHT") {
        // Calculate new end index
        const newWidth = initialWidth + distance;
        const newEndIndex = Math.min(
          gantt.columns.length - 1,
          Math.floor((initialLeft + newWidth) / ganttConfig.columnSize)
        );

        // Ensure end index is not before start index
        if (newEndIndex < initialStartIndex) {
          resetResize();
          return;
        }

        const startColumn = gantt.columns[initialStartIndex];
        const endColumn = gantt.columns[newEndIndex];

        if (!startColumn || !endColumn) {
          resetResize();
          return;
        }

        if (timeline.isChildSummary) {
          const oneDay = 86400;
          const distanceIndex = newEndIndex - initialEndIndex;
          const distanceTime = distanceIndex * oneDay;

          updateTasks(
            subtasks.reduce<UpdateTask[]>((acc, subtask) => {
              if (subtask.startDate && subtask.dueDate) {
                acc.push({
                  _id: subtask._id,
                  startDate: subtask.startDate,
                  dueDate: subtask.dueDate + distanceTime,
                });
              }
              return acc;
            }, [])
          );
        } else {
          const startDate = DateTime.toSeconds(startColumn.start);
          const endDate = DateTime.toSeconds(endColumn.end);

          updateTasks({
            _id: task._id,
            startDate,
            dueDate: endDate,
          });
        }
      }

      resetResize();
    };

    const onMouseLeave = () => {
      if (resizing) {
        resetResize();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && resizing) {
        resetResize();
      }
    };

    const leftPointer = resizeLeftPointerRef.current;
    const rightPointer = resizeRightPointerRef.current;

    leftPointer?.addEventListener("mousedown", onMouseDown("LEFT"));
    rightPointer?.addEventListener("mousedown", onMouseDown("RIGHT"));

    ganttTaskAreaRef.current.addEventListener("mousemove", onMouseMove);
    ganttTaskAreaRef.current.addEventListener("mouseup", onMouseUp);
    ganttTaskAreaRef.current.addEventListener("mouseleave", onMouseLeave);

    window.addEventListener("keydown", onKeyDown);

    return () => {
      leftPointer?.removeEventListener("mousedown", onMouseDown("LEFT"));
      rightPointer?.removeEventListener("mousedown", onMouseDown("RIGHT"));

      ganttTaskAreaRef.current?.removeEventListener("mousemove", onMouseMove);
      ganttTaskAreaRef.current?.removeEventListener("mouseup", onMouseUp);
      ganttTaskAreaRef.current?.removeEventListener("mouseleave", onMouseLeave);

      window.removeEventListener("keydown", onKeyDown);
    };
  }, [timeline, gantt.columns, task._id, updateTasks]);

  return (
    <Group miw={0} w="100%" gap={0} h="100%" align="stretch" pos="relative" style={{ zIndex: 1 }}>
      <Group
        h="100%"
        align="center"
        w={16}
        justify="center"
        ref={resizeLeftPointerRef}
        className={styles.GanttTaskTimelineResizePointer}
      >
        <IconChevronCompactLeft size={12} color="white" />
      </Group>

      {children}

      <Group
        h="100%"
        align="center"
        w={16}
        justify="center"
        className={styles.GanttTaskTimelineResizePointer}
        ref={resizeRightPointerRef}
      >
        <IconChevronCompactRight size={12} color="white" />
      </Group>
    </Group>
  );
};
