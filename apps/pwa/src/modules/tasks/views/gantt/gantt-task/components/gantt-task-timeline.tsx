"use client";

import { classNames } from "@/utils/ui.utils";
import { Fragment, useEffect, useMemo, useRef, type FC } from "react";
import { useGanttTaskRow } from "../gantt-task-provider";

import QUERY_TASKS, {
  type TasksQuery,
  type TasksQueryVariables,
} from "@/modules/tasks/graphql/queryTasks.graphql";
import { UpdateTask, useUpdateTasks } from "@/modules/tasks/hooks/use-update-tasks";
import { useTaskMenu } from "@/modules/tasks/components/task-menu/task-menu";
import { useColor } from "@/modules/theme/use-color";
import { useApolloClient } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { alpha, Group, Text } from "@mantine/core";
import { ganttConfig } from "../../gantt-tasks-config";
import { useGantt } from "../../gantt-tasks-context";
import styles from "../../gantt-tasks.module.css";
import { GanttTaskTimelineChildSummary } from "./gantt-task-timeline-child-symmary";
import { GanttTaskTimelineResizable } from "./gantt-task-timeline-resizable";

export const GanttTaskTimeline: FC = () => {
  const client = useApolloClient();
  const color = useColor();
  const gantt = useGantt();
  const { updateTasks } = useUpdateTasks();

  const { timeline, task, subTasksGroupVariables, ganttTaskAreaRef, groupVariables } =
    useGanttTaskRow();

  const taskMenu = useTaskMenu({ task, groupVariables });

  const timelineRef = useRef<HTMLDivElement>(null);

  const taskStatus = useMemo(() => {
    return task.statuses.find((v) => v.id === task.status) || task.statuses[0];
  }, [task.status, task.statuses]);

  // Handle moving estimated
  useEffect(() => {
    if (!timeline?.isCanMove || !timelineRef.current) return;

    let dragging = false;
    let initialX = 0;

    const resetMove = () => {
      timelineRef.current?.style.setProperty("left", `${timeline.left}px`);
      dragging = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        dragging = true;
        initialX = e.pageX;
        return;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!dragging || e.button !== 0) return;

      dragging = false;

      // Calculate the distance moved
      const distance = e.pageX - initialX;
      const newLeft = timeline.left + distance;

      // Calculate the new column indices
      const newStartIndex = Math.max(0, Math.floor(newLeft / ganttConfig.columnSize));
      const numberOfColumns = timeline.endIndex - timeline.startIndex + 1;
      const newEndIndex = Math.min(gantt.columns.length - 1, newStartIndex + numberOfColumns - 1);

      // Get the columns for the new position
      const startColumn = gantt.columns[newStartIndex];
      const endColumn = gantt.columns[newEndIndex];

      if (!startColumn && endColumn) return resetMove();

      if (timeline.isChildSummary) {
        const oneDay = 86400;
        const distanceIndex = newStartIndex - timeline.startIndex;
        const distanceTime = distanceIndex * oneDay;

        const subtasksData = client.cache.readQuery<TasksQuery, TasksQueryVariables>({
          query: QUERY_TASKS,
          variables: subTasksGroupVariables,
        });

        const subtasks = Array.from(subtasksData?.tasks.results ?? []);

        updateTasks(
          subtasks.reduce<UpdateTask[]>((acc, subtask) => {
            if (subtask.startDate && subtask.dueDate) {
              acc.push({
                _id: subtask._id,
                startDate: subtask.startDate + distanceTime,
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
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const distance = e.pageX - initialX;
      timelineRef.current?.style.setProperty("left", `${timeline.left + distance}px`);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resetMove();
      }
    };

    timelineRef.current?.addEventListener("mousedown", onMouseDown);
    timelineRef.current?.addEventListener("mouseup", onMouseUp);
    timelineRef.current?.addEventListener("mouseleave", resetMove);

    ganttTaskAreaRef.current?.addEventListener("mousemove", onMouseMove);
    ganttTaskAreaRef.current?.addEventListener("mouseleave", resetMove);

    window.addEventListener("keydown", onKeyDown);

    return () => {
      timelineRef.current?.removeEventListener("mousedown", onMouseDown);
      timelineRef.current?.removeEventListener("mouseup", onMouseUp);
      timelineRef.current?.removeEventListener("mouseleave", resetMove);

      ganttTaskAreaRef.current?.removeEventListener("mousemove", onMouseMove);
      ganttTaskAreaRef.current?.removeEventListener("mouseleave", resetMove);

      window.removeEventListener("keydown", onKeyDown);
      resetMove();
    };
  }, [timeline, gantt.columns, task._id, updateTasks, taskMenu]);

  useEffect(() => {
    if (!timeline) return;

    const onMouseEnter = () => {
      ganttTaskAreaRef.current?.setAttribute("data-timeline-event", "hovering");
    };

    const onMouseLeave = () => {
      ganttTaskAreaRef.current?.removeAttribute("data-timeline-event");
    };

    timelineRef.current?.addEventListener("mouseenter", onMouseEnter);
    timelineRef.current?.addEventListener("mouseleave", onMouseLeave);

    return () => {
      timelineRef.current?.removeEventListener("mouseenter", onMouseEnter);
      timelineRef.current?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [timeline]);

  const taskColor = useMemo(() => {
    return gantt.state.isShowTaskstatusColor
      ? color(taskStatus.color ?? "gray")
      : color("primary.4");
  }, [gantt.state.isShowTaskstatusColor, taskStatus.color]);

  if (!timeline) return null;

  return (
    <div
      ref={timelineRef}
      className={classNames(styles.GanttTaskTimeline, {
        [styles.isChildSummary]: timeline.isChildSummary,
        [styles.Draggable]: timeline.isCanMove,
      })}
      style={{
        left: timeline.left,
        width: timeline.width,
        background: timeline.isChildSummary ? "transparent" : alpha(taskColor, 0.6),
      }}
    >
      {timeline.isChildSummary ? (
        <GanttTaskTimelineChildSummary />
      ) : (
        <Fragment>
          <GanttTaskTimelineResizable timelineRef={timelineRef}>
            <Group h="100%" miw={0} flex={1} align="center">
              <Text fz={11} fw={500} truncate c="white" maw="100%" flex={1}>
                {task.name}
              </Text>
            </Group>
          </GanttTaskTimelineResizable>

          <div
            className={styles.GanttTaskTimelineProgress}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${task.progress}%`,
              height: "100%",
              background: alpha(taskColor, 0.6),
              transition: "width 0.2s ease-in-out",
            }}
          />
        </Fragment>
      )}
    </div>
  );
};
