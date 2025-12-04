"use client";

import { ActionIcon, Group, Text } from "@mantine/core";
import {
  FC,
  Fragment,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { TaskDataFragment } from "../../queries/fragmentTask.graphql";
import { ganttConfig } from "./gantt-tasks-config";

import { ContentEditable } from "@/components/content-editable/content-editable";
import { useColor } from "@/modules/theme/use-color";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconGripVertical, IconMaximize } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { updateTaskPath } from "../../tasks-route-helpers";
import { useGantt } from "./gantt-tasks-context";
import { useGanttRefs } from "./gantt-tasks-refs";
import styles from "./gantt-tasks.module.css";
import { DateTime } from "@joy-one-client/utils/date-time";

interface GanttTaskRowProps {
  task: TaskDataFragment;
}

export const GanttTaskRow: FC<GanttTaskRowProps> = ({ task }) => {
  const gantt = useGantt();
  const router = useRouter();
  const ganttRefs = useGanttRefs();
  const { updateTasks } = useUpdateTasks();

  const [isNameEditing, setIsNameEditing] = useState(false);

  const taskDataRef = useRef<HTMLDivElement>(null);
  const taskTimelineRef = useRef<HTMLDivElement>(null);
  const movePointerRef = useRef<HTMLDivElement>(null);
  const estimatingPointerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const estimatedRangeRef = useRef<HTMLDivElement>(null);

  const color = useColor();
  const estimatingStartRef = useRef<number | null>(null);

  const onUpdateName = useDebouncedCallback((name: string) => {
    if (!task._id || name === task.name) return;
    updateTasks({ _id: task._id, name });
  }, 500);

  const openTask = () => {
    router.push(updateTaskPath(location.pathname, { code: task.code }));
  };

  useEffect(() => {
    if (!taskTimelineRef.current || !taskDataRef.current) return;

    const syncPosition = () => {
      const offsetTop = taskDataRef.current?.offsetTop ?? 0;
      const top = offsetTop - ganttConfig.headHeight;
      taskTimelineRef.current?.style.setProperty("top", `${top}px`);
      taskTimelineRef.current?.style.setProperty("opacity", `1`);
    };

    syncPosition();

    const mutationObserver = new MutationObserver(syncPosition);

    mutationObserver.observe(ganttRefs.sidebarContainer.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, [task._id]);

  const onTaskTimelineMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!taskTimelineRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();

    const x = Math.max(0, Math.round(e.pageX - rect.left - (window.scrollX || window.scrollX)));

    movePointerRef.current?.style.setProperty("left", `${x}px`);

    if (estimatingStartRef.current) {
      const width = x - estimatingStartRef.current;
      if (width < 20) return;
      estimatingPointerRef.current?.style.setProperty("width", `${width}px`);
      movePointerRef.current?.style.setProperty("opacity", `0`);
    } else {
      movePointerRef.current?.style.setProperty("opacity", `1`);
    }
  };

  const onTaskTimelineMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!taskTimelineRef.current || !estimatingPointerRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();

      const x = Math.max(0, Math.round(e.pageX - rect.left - (window.scrollX || window.scrollX)));

      const indexOfColumn = Math.floor(x / gantt.state.columnSize);
      const startOfColumn = indexOfColumn * gantt.state.columnSize;

      estimatingStartRef.current = startOfColumn;

      estimatingPointerRef.current.style.setProperty("opacity", `1`);
      estimatingPointerRef.current.style.setProperty("left", `${estimatingStartRef.current}px`);
      estimatedRangeRef.current?.style.setProperty("display", `none`);
    },
    [taskTimelineRef.current, estimatingPointerRef.current, gantt.state.columnSize]
  );

  const onTaskTimelineMouseUp: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!taskTimelineRef.current || !estimatingStartRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();

      const x = Math.max(0, Math.round(e.pageX - rect.left - (window.scrollX || window.scrollX)));

      const indexOfStartColumn = Math.floor(estimatingStartRef.current / gantt.state.columnSize);
      const indexOfEndColumn = Math.floor(x / gantt.state.columnSize);
      const startColumn = gantt.columns[indexOfStartColumn];
      const endColumn = gantt.columns[indexOfEndColumn];

      if (startColumn && endColumn) {
        updateTasks({
          _id: task._id,
          startDate: DateTime.toSeconds(startColumn.start),
          dueDate: DateTime.toSeconds(endColumn.end),
        });
      }

      // Reset
      estimatingStartRef.current = null;
      estimatingPointerRef.current?.style.setProperty("opacity", `0`);
      estimatingPointerRef.current?.style.removeProperty("width");
      estimatedRangeRef.current?.style.setProperty("display", `block`);
    },
    [taskTimelineRef.current, estimatingPointerRef.current, gantt.state.columnSize, gantt.columns]
  );

  const estimated = useMemo(() => {
    if (task.startDate && task.dueDate) {
      const startDate = DateTime.toSeconds(task.startDate);
      const dueDate = DateTime.toSeconds(task.dueDate);

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
        left: startIndex * gantt.state.columnSize,
        width: (endIndex - startIndex + 1) * gantt.state.columnSize,
      };
    }
  }, [task.startDate, task.dueDate, gantt.columns, gantt.state.columnSize]);

  return (
    <Fragment>
      <Group
        ref={taskDataRef}
        className={styles.TaskRowData}
        w="100%"
        miw={0}
        gap={0}
        style={{
          position: "relative",
          minHeight: ganttConfig.rowHeight,
          maxHeight: ganttConfig.rowHeight,
          borderBottom: `1px solid var(--app-divider-color)`,
        }}
        onMouseEnter={() => {
          taskTimelineRef.current?.setAttribute("hovered", "true");
          actionsRef.current?.style.setProperty("display", "flex");
        }}
        onMouseLeave={() => {
          taskTimelineRef.current?.removeAttribute("hovered");
          actionsRef.current?.style.setProperty("display", "none");
        }}
        wrap="nowrap"
      >
        <ActionIcon
          className={styles.DragHandle}
          variant="transparent"
          color="gray"
          style={{ cursor: "move", outline: "none" }}
        >
          <IconGripVertical size={16} strokeWidth={1.2} />
        </ActionIcon>

        {isNameEditing ? (
          <ContentEditable
            fz={14}
            fw={500}
            value={task.name}
            autoFocus
            onChange={onUpdateName}
            onBlur={() => setIsNameEditing(false)}
          />
        ) : (
          <Text
            fz={14}
            fw={500}
            flex={1}
            truncate
            onClick={() => setIsNameEditing(true)}
            className="clickable"
          >
            {task.name}
          </Text>
        )}

        <Group ref={actionsRef} px={8} style={{ display: "none" }}>
          <ActionIcon variant="subtle" color="gray" onClick={openTask}>
            <IconMaximize size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {createPortal(
        <Fragment>
          <div
            ref={taskTimelineRef}
            className={styles.TaskRowTimeline}
            style={{
              position: "absolute",
              minHeight: ganttConfig.rowHeight,
              maxHeight: ganttConfig.rowHeight,
              width: "100%",
              left: 0,
              zIndex: 1,
              opacity: 0,
            }}
            onMouseMove={onTaskTimelineMouseMove}
            onMouseDown={onTaskTimelineMouseDown}
            onMouseUp={onTaskTimelineMouseUp}
            onMouseEnter={() => {
              taskDataRef.current?.setAttribute("hovered", "true");
            }}
            onMouseLeave={() => {
              taskDataRef.current?.removeAttribute("hovered");
              movePointerRef.current?.style.setProperty("opacity", `0`);
            }}
          >
            <div
              ref={movePointerRef}
              className={styles.MovePointer}
              style={{ borderColor: color("primary.3"), opacity: 0 }}
            />

            <div
              ref={estimatingPointerRef}
              className={styles.EstimatingPointer}
              style={{ background: color("primary.3"), opacity: 0 }}
            />

            {estimated && (
              <div
                ref={estimatedRangeRef}
                className={styles.EstimatedRange}
                style={{
                  left: estimated?.left,
                  width: estimated?.width,
                  background: color("primary.4"),
                }}
              />
            )}
          </div>
        </Fragment>,
        ganttRefs.body.current,
        task._id + "-timeline"
      )}
    </Fragment>
  );
};
