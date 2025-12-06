"use client";

import { useColor } from "@/modules/theme/use-color";
import { Fragment, useEffect, useMemo, useRef, type FC } from "react";

import { DateTime } from "@joy-one-client/utils/date-time";
import { useUpdateTasks } from "../../../../hooks/use-update-tasks";
import { ganttConfig } from "../../gantt-tasks-config";
import { useGantt } from "../../gantt-tasks-context";
import styles from "../../gantt-tasks.module.css";
import { useGanttTaskRow } from "../gantt-task-provider";

export const GanttTaskDrawTimeline: FC = () => {
  const color = useColor();
  const gantt = useGantt();
  const { ganttTaskAreaRef, timeline, task } = useGanttTaskRow();
  const estimatingMovingPointerRef = useRef<HTMLDivElement>(null);
  const estimatingPointerRef = useRef<HTMLDivElement>(null);
  const { updateTasks } = useUpdateTasks();

  const isAvailable = useMemo(() => {
    return (
      !timeline &&
      !gantt.isGrabbing &&
      (!task.childTimeline?.startDate || !task.childTimeline?.dueDate)
    );
  }, [task.childTimeline, gantt.isGrabbing, timeline]);

  const resetEstimating = () => {
    estimatingPointerRef.current?.style.setProperty("opacity", `0`);
    estimatingPointerRef.current?.style.removeProperty("width");
    estimatingMovingPointerRef.current?.style.setProperty("opacity", `0`);
  };

  useEffect(() => {
    if (!isAvailable) return;

    let estimatingStart = 0;

    const onTimelineMouseDown = (e: MouseEvent) => {
      if (!ganttTaskAreaRef.current || !estimatingPointerRef.current || e.button !== 0) return;
      const rect = ganttTaskAreaRef.current.getBoundingClientRect();

      const x = Math.max(0, Math.round(e.pageX - rect.left - (window.scrollX || window.scrollX)));

      const indexOfColumn = Math.floor(x / ganttConfig.columnSize);
      const startOfColumn = indexOfColumn * ganttConfig.columnSize;

      estimatingStart = startOfColumn;

      estimatingPointerRef.current.style.setProperty("opacity", `1`);
      estimatingPointerRef.current.style.setProperty("left", `${estimatingStart}px`);
    };

    const onTimelineMouseMove = (e: MouseEvent) => {
      if (!ganttTaskAreaRef.current || !estimatingPointerRef.current) return;
      const rect = ganttTaskAreaRef.current.getBoundingClientRect();

      const x = Math.max(0, Math.round(e.pageX - rect.left - (window.scrollX || window.scrollX)));

      estimatingMovingPointerRef.current?.style.setProperty("left", `${x}px`);

      if (estimatingStart) {
        const width = x - estimatingStart;
        if (width < 20) return;
        estimatingPointerRef.current?.style.setProperty("width", `${width}px`);
        estimatingMovingPointerRef.current?.style.setProperty("opacity", `0`);
      } else {
        estimatingMovingPointerRef.current?.style.setProperty("opacity", `1`);
      }
    };

    const onTimelineMouseUp = (e: MouseEvent) => {
      if (!ganttTaskAreaRef.current || !estimatingPointerRef.current) return;
      const rect = ganttTaskAreaRef.current.getBoundingClientRect();

      const x = Math.max(0, Math.round(e.pageX - rect.left - (window.scrollX || window.scrollX)));

      const indexOfStartColumn = Math.floor(estimatingStart / ganttConfig.columnSize);
      const indexOfEndColumn = Math.floor(x / ganttConfig.columnSize);
      const startColumn = gantt.columns[indexOfStartColumn];
      const endColumn = gantt.columns[indexOfEndColumn];

      if (startColumn && endColumn) {
        updateTasks({
          _id: task._id,
          startDate: DateTime.toSeconds(startColumn.start),
          dueDate: DateTime.toSeconds(endColumn.end),
        });
      }

      resetEstimating();
    };

    const onTimelineMouseLeave = () => {
      resetEstimating();
    };

    const onWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resetEstimating();
      }
    };

    ganttTaskAreaRef.current?.addEventListener("mousedown", onTimelineMouseDown);
    ganttTaskAreaRef.current?.addEventListener("mousemove", onTimelineMouseMove);
    ganttTaskAreaRef.current?.addEventListener("mouseup", onTimelineMouseUp);
    ganttTaskAreaRef.current?.addEventListener("mouseleave", onTimelineMouseLeave);
    window.addEventListener("keydown", onWindowKeyDown);

    return () => {
      ganttTaskAreaRef.current?.removeEventListener("mousedown", onTimelineMouseDown);
      ganttTaskAreaRef.current?.removeEventListener("mousemove", onTimelineMouseMove);
      ganttTaskAreaRef.current?.removeEventListener("mouseup", onTimelineMouseUp);
      ganttTaskAreaRef.current?.removeEventListener("mouseleave", onTimelineMouseLeave);
      window.removeEventListener("keydown", onWindowKeyDown);
    };
  }, [isAvailable]);

  return (
    <Fragment>
      <div
        ref={estimatingMovingPointerRef}
        className={styles.MovePointer}
        style={{ borderColor: color("primary.2"), opacity: 0 }}
      />

      <div
        ref={estimatingPointerRef}
        className={styles.EstimatingPointer}
        style={{ background: color("primary.2"), opacity: 0 }}
      />
    </Fragment>
  );
};
