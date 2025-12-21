"use client";

import { useColor } from "@/modules/theme/use-color";
import { Fragment, useEffect, useMemo, useRef, type FC } from "react";

import { DateFormat } from "@/components/format/date-format";
import { ModalConfirm, ModalConfirmRef } from "@/modals/modal-confirm";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { Stack, Text } from "@mantine/core";
import { IconClockPlay } from "@tabler/icons-react";
import { useUpdateTasks } from "../../../../hooks/use-update-tasks";
import { ganttConfig } from "../../gantt-tasks-config";
import { useGantt } from "../../gantt-tasks-context";
import { useGanttRefs } from "../../gantt-tasks-refs";
import styles from "../../gantt-tasks.module.css";
import { useGanttTaskRow } from "../gantt-task-provider";

export const GanttTaskDrawTimeline: FC = () => {
  const color = useColor();
  const gantt = useGantt();
  const ganttRefs = useGanttRefs();
  const modalConfirmRef = useRef<ModalConfirmRef | null>(null);

  const { updateTasks } = useUpdateTasks();
  const { ganttTaskAreaRef, timeline, task } = useGanttTaskRow();

  const estimatingMovingPointerRef = useRef<HTMLDivElement>(null);
  const estimatingPointerRef = useRef<HTMLDivElement>(null);

  const isAvailable = useMemo(() => {
    return !gantt.isGrabbing && !timeline?.isChildSummary;
  }, [task.childTimeline, gantt.isGrabbing, timeline]);

  useEffect(() => {
    if (!isAvailable) return;

    let estimatingStart = 0;
    let disabled = false;

    const resetDrawTimeline = () => {
      estimatingPointerRef.current?.style.setProperty("opacity", `0`);
      estimatingPointerRef.current?.style.removeProperty("width");
      estimatingMovingPointerRef.current?.style.setProperty("opacity", `0`);
      estimatingStart = 0;
    };

    const onGanttTaskAreaMouseDown = (e: MouseEvent) => {
      if (!ganttTaskAreaRef.current || !estimatingPointerRef.current || e.button !== 0 || disabled)
        return;

      const rect = ganttTaskAreaRef.current.getBoundingClientRect();

      const x = Math.max(0, Math.round(e.pageX - rect.left - (window.scrollX || window.scrollX)));

      const indexOfColumn = Math.floor(x / ganttConfig.columnSize);
      const startOfColumn = indexOfColumn * ganttConfig.columnSize;

      estimatingStart = startOfColumn;

      estimatingPointerRef.current.style.setProperty("opacity", `1`);
      estimatingPointerRef.current.style.setProperty("left", `${estimatingStart}px`);
    };

    const onGanttTaskAreaMouseMove = (e: MouseEvent) => {
      if (!ganttTaskAreaRef.current || !estimatingPointerRef.current || disabled) return;

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

    const onGanttTaskAreaMouseUp = (e: MouseEvent) => {
      if (
        !ganttTaskAreaRef.current ||
        !estimatingPointerRef.current ||
        estimatingStart === 0 ||
        disabled
      ) {
        return;
      }

      const rect = ganttTaskAreaRef.current.getBoundingClientRect();

      const x = Math.max(0, Math.round(e.pageX - rect.left - (window.scrollX || window.scrollX)));

      const indexOfStartColumn = Math.floor(estimatingStart / ganttConfig.columnSize);
      const indexOfEndColumn = Math.floor(x / ganttConfig.columnSize);
      const startColumn = gantt.columns[indexOfStartColumn];
      const endColumn = gantt.columns[indexOfEndColumn];

      if (startColumn && endColumn) {
        const action = () => {
          updateTasks({
            _id: task._id,
            startDate: DateTime.toSeconds(startColumn.start),
            dueDate: DateTime.toSeconds(endColumn.end),
          });
        };

        if (task.startDate && task.dueDate) {
          modalConfirmRef.current?.open({
            color: "orange",
            customModalProps: {
              size: "lg",
            },
            icon: IconClockPlay,
            content: (
              <Stack>
                <Text fw={500} fz="md" c="orange">
                  <Trans>Are you sure you want to change the timeline?</Trans>
                </Text>
                <Stack gap={3}>
                  <Text>
                    <Trans>Current timeline</Trans>
                    <strong>
                      {": "} <DateFormat value={task.startDate} type="date" />
                      {" - "}
                      <DateFormat value={task.dueDate} type="date" />
                    </strong>
                  </Text>

                  <Text>
                    <Trans>Change to</Trans>
                    {": "}
                    <strong>
                      <DateFormat value={startColumn.start} type="date" />
                      {" - "}
                      <DateFormat value={endColumn.end} type="date" />
                    </strong>
                  </Text>
                </Stack>
              </Stack>
            ),
            onConfirm: action,
          });
        } else {
          action();
        }
      }

      resetDrawTimeline();
    };

    const onGanttTaskAreaMouseLeave = () => {
      resetDrawTimeline();
    };

    const onWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resetDrawTimeline();
      }
    };

    ganttTaskAreaRef.current?.addEventListener("mousedown", onGanttTaskAreaMouseDown);
    ganttTaskAreaRef.current?.addEventListener("mousemove", onGanttTaskAreaMouseMove);
    ganttTaskAreaRef.current?.addEventListener("mouseup", onGanttTaskAreaMouseUp);
    ganttTaskAreaRef.current?.addEventListener("mouseleave", onGanttTaskAreaMouseLeave);
    window.addEventListener("keydown", onWindowKeyDown);

    const observer = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.attributeName === "data-timeline-event") {
          const attributeValue = (m.target as HTMLElement).getAttribute("data-timeline-event");
          if (attributeValue) {
            disabled = true;
            resetDrawTimeline();
          } else {
            disabled = false;
          }
        }
      }
    });

    if (ganttTaskAreaRef.current) observer.observe(ganttTaskAreaRef.current, { attributes: true });

    const onBodyContainerScroll = () => {
      resetDrawTimeline();
    };

    ganttRefs.bodyContainer.current?.addEventListener("scroll", onBodyContainerScroll);

    return () => {
      ganttRefs.bodyContainer.current?.removeEventListener("scroll", onBodyContainerScroll);
      ganttTaskAreaRef.current?.removeEventListener("mousedown", onGanttTaskAreaMouseDown);
      ganttTaskAreaRef.current?.removeEventListener("mousemove", onGanttTaskAreaMouseMove);
      ganttTaskAreaRef.current?.removeEventListener("mouseup", onGanttTaskAreaMouseUp);
      ganttTaskAreaRef.current?.removeEventListener("mouseleave", onGanttTaskAreaMouseLeave);
      window.removeEventListener("keydown", onWindowKeyDown);
      observer.disconnect();
      resetDrawTimeline();
    };
  }, [isAvailable, task]);

  return (
    <Fragment>
      <div
        className={styles.MovePointer}
        ref={estimatingMovingPointerRef}
        style={{ borderColor: color("primary.2"), opacity: 0 }}
      />

      <div
        ref={estimatingPointerRef}
        className={styles.EstimatingPointer}
        style={{ background: color("primary.2"), opacity: 0 }}
      />

      <ModalConfirm ref={modalConfirmRef} />
    </Fragment>
  );
};
