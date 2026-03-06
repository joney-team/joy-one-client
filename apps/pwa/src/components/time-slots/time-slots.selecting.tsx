import {
  displayMinutes,
  getMinutesFromStringTime,
  getMousePosInElement,
  getParentScrollContainer,
  getSelectedTimeRange,
  normalizeTimeForOutput,
  useTimeSlotsAttributes,
} from "./time-slots.utils";

import { useAutoScrollOnDrag } from "@/hooks/use-auto-scroll-on-drag";
import { useEscape } from "@/hooks/use-escape";
import { useEffect, useMemo, useRef } from "react";
import { Fragment } from "react/jsx-runtime";
import { HOURS, TIME_SLOTS_CONFIG } from "./time-slots.constants";
import styles from "./time-slots.module.css";

const extendPointerHeight = 10;

export const TimeSlotsSelecting = () => {
  const {
    cursorColumnIndex,
    cursorTime,
    selectTimeFrom,
    selectColumnIndex,
    headRect,
    columnWidth,
    stepInMinutes,
    rootRef,
    onSelect,
    rootRect,
    cols,
    ...rest
  } = useTimeSlotsAttributes();

  const availableTimeIntervals = rest.isAllowUnavailableTimeIntervals
    ? undefined
    : rest.availableTimeIntervals;

  const scrollContainerRef = useRef<HTMLElement | null | undefined>(null);

  useAutoScrollOnDrag({
    containerRef: scrollContainerRef,
    enabled: !!selectTimeFrom,
  });

  const selectingTimeRange = useMemo(() => {
    if (!cursorTime) return;

    const timeRage = getSelectedTimeRange({
      from: selectTimeFrom,
      to: cursorTime,
      stepInMinutes,
      availableTimeIntervals,
    });

    if (timeRage && typeof selectColumnIndex === "number") {
      const { start, end } = timeRage;

      return (
        <div
          className={styles.SelectingTimeRange}
          style={{
            left: `${TIME_SLOTS_CONFIG.hourColumnWidth + selectColumnIndex * columnWidth}px`,
            top: headRect.height + (start / 60) * TIME_SLOTS_CONFIG.hourCellHeight,
            width: columnWidth - 1,
            height: ((end - start) / 60) * TIME_SLOTS_CONFIG.hourCellHeight,
          }}
        >
          {displayMinutes(start)} - {displayMinutes(end)}
        </div>
      );
    }

    return null;
  }, [
    selectTimeFrom,
    cursorTime,
    selectColumnIndex,
    columnWidth,
    stepInMinutes,
    availableTimeIntervals,
  ]);

  const [selectingFromHour, selectingFromMinute] = (cursorTime ?? "").split(":").map(Number);

  const onReset = () => {
    rootRef.current?.removeAttribute(TIME_SLOTS_CONFIG.selectTimeFromAttr);
    rootRef.current?.removeAttribute(TIME_SLOTS_CONFIG.cursorColumnIndexAttr);
  };

  useEscape({
    id: "time-slots-selecting",
    onEscape: onReset,
    active: typeof cursorColumnIndex === "number" && !!cursorTime && !!onSelect,
  });

  useEffect(() => {
    if (!rootRef.current || !onSelect) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!rootRef.current) return;

      const position = getMousePosInElement(e, rootRef.current);

      const columnWidth = (rootRect.width - TIME_SLOTS_CONFIG.hourColumnWidth) / cols.length;

      const columnIndex =
        position.x <= TIME_SLOTS_CONFIG.hourColumnWidth
          ? -1
          : Math.min(
              cols.length - 1,
              Math.max(
                0,
                Math.floor((position.x - TIME_SLOTS_CONFIG.hourColumnWidth) / columnWidth)
              )
            );

      const rowHourIndex =
        position.y <= headRect.height
          ? -1
          : Math.min(
              HOURS.length - 1,
              Math.max(
                0,
                Math.floor((position.y - headRect.height) / TIME_SLOTS_CONFIG.hourCellHeight)
              )
            );

      const steps = 60 / stepInMinutes;
      const stepPosition = ((position.y - headRect.height) / TIME_SLOTS_CONFIG.hourCellHeight) % 1;
      const stepPart = Math.floor(stepPosition * steps);

      const hour = HOURS[rowHourIndex];
      const minute = stepPart * stepInMinutes;

      if (typeof hour !== "undefined" && minute >= 0 && columnIndex > -1) {
        rootRef.current.setAttribute(
          TIME_SLOTS_CONFIG.cursorTimeAttr,
          `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        );

        rootRef.current.setAttribute(
          TIME_SLOTS_CONFIG.cursorColumnIndexAttr,
          columnIndex.toString()
        );
      } else {
        rootRef.current.removeAttribute(TIME_SLOTS_CONFIG.cursorTimeAttr);
        rootRef.current.removeAttribute(TIME_SLOTS_CONFIG.cursorColumnIndexAttr);
      }
    };

    const onMouseLeave = () => {
      if (rootRef.current) {
        rootRef.current.removeAttribute(TIME_SLOTS_CONFIG.cursorColumnIndexAttr);
        rootRef.current.removeAttribute(TIME_SLOTS_CONFIG.cursorTimeAttr);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (
        e.target instanceof HTMLElement &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        (e.target as HTMLElement).getAttribute("data-element") === "pointer"
      ) {
        e.preventDefault();
        e.stopPropagation();

        const cursorFromTime = rootRef.current?.getAttribute(TIME_SLOTS_CONFIG.cursorTimeAttr);
        const columnIndex = rootRef.current?.getAttribute(TIME_SLOTS_CONFIG.cursorColumnIndexAttr);

        if (!cursorFromTime || !columnIndex) return;

        const cursorFromTimeInMinutes = getMinutesFromStringTime(cursorFromTime);

        if (cursorFromTimeInMinutes === null) return;

        if (availableTimeIntervals && availableTimeIntervals.length > 0) {
          const cursorFromTimeToMinutes = cursorFromTimeInMinutes + stepInMinutes;
          const availableInterval = availableTimeIntervals.find((interval) => {
            const intervalTimes = {
              start: getMinutesFromStringTime(interval.start)!,
              end: getMinutesFromStringTime(interval.end)!,
            };

            return (
              ((intervalTimes.start <= cursorFromTimeInMinutes &&
                intervalTimes.end >= cursorFromTimeInMinutes) ||
                (intervalTimes.start <= cursorFromTimeToMinutes &&
                  intervalTimes.end >= cursorFromTimeToMinutes)) &&
              interval.columnIndex === +columnIndex
            );
          });

          if (!availableInterval) return;

          const { start, end } = availableInterval;
          const startInterval = getMinutesFromStringTime(start)!;
          const endInterval = getMinutesFromStringTime(end)!;

          if (cursorFromTimeInMinutes >= startInterval && cursorFromTimeInMinutes <= endInterval) {
            rootRef.current?.setAttribute(TIME_SLOTS_CONFIG.selectTimeFromAttr, cursorFromTime);
          } else {
            rootRef.current?.setAttribute(TIME_SLOTS_CONFIG.selectTimeFromAttr, start);
          }

          rootRef.current?.setAttribute(TIME_SLOTS_CONFIG.selectColumnIndexAttr, columnIndex);
        } else {
          rootRef.current?.setAttribute(TIME_SLOTS_CONFIG.selectTimeFromAttr, cursorFromTime);
          rootRef.current?.setAttribute(TIME_SLOTS_CONFIG.selectColumnIndexAttr, columnIndex);
        }
      }
    };

    const onMouseUp = () => {
      const columnIndex = +(
        rootRef.current?.getAttribute(TIME_SLOTS_CONFIG.cursorColumnIndexAttr) ?? "-1"
      );

      const rangeTime = getSelectedTimeRange({
        from: rootRef.current?.getAttribute(TIME_SLOTS_CONFIG.selectTimeFromAttr),
        to: rootRef.current?.getAttribute(TIME_SLOTS_CONFIG.cursorTimeAttr),
        stepInMinutes,
        availableTimeIntervals,
      });

      if (!rangeTime || columnIndex === -1) return;

      onSelect({
        start: normalizeTimeForOutput(rangeTime.start),
        end: normalizeTimeForOutput(rangeTime.end),
        columnIndex,
      });

      onReset();
    };

    rootRef.current.addEventListener("mousedown", onMouseDown);
    rootRef.current.addEventListener("mouseup", onMouseUp);
    rootRef.current.addEventListener("mousemove", onMouseMove);
    rootRef.current.addEventListener("mouseleave", onMouseLeave);

    scrollContainerRef.current = getParentScrollContainer(rootRef.current);

    return () => {
      rootRef.current?.removeEventListener("mousedown", onMouseDown);
      rootRef.current?.removeEventListener("mouseup", onMouseUp);
      rootRef.current?.removeEventListener("mousemove", onMouseMove);
      rootRef.current?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [
    rootRef.current,
    onSelect,
    cols,
    availableTimeIntervals,
    stepInMinutes,
    availableTimeIntervals,
  ]);

  useEffect(() => {
    if (!cursorTime) onReset();
  }, [cursorTime]);

  if (typeof cursorColumnIndex !== "number" || !cursorTime || !onSelect) return null;

  return (
    <Fragment>
      {selectingTimeRange}

      <div
        className={styles.Pointer}
        data-element="pointer"
        style={{
          left: `${TIME_SLOTS_CONFIG.hourColumnWidth + cursorColumnIndex * columnWidth}px`,
          top:
            headRect.height +
            ((selectingFromHour * 60 + selectingFromMinute) / 60) *
              TIME_SLOTS_CONFIG.hourCellHeight -
            extendPointerHeight,
          height: (stepInMinutes / 60) * TIME_SLOTS_CONFIG.hourCellHeight + extendPointerHeight * 2,
          width: columnWidth - 1,
        }}
      />
    </Fragment>
  );
};
