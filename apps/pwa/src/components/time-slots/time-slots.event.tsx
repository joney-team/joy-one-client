import { FC, useEffect, useMemo, useRef, useState } from "react";
import { TIME_SLOTS_CONFIG, useTimeSlots } from "./time-slots.constants";
import { TimeEvent } from "./time-slots.types";
import {
  displayMinutes,
  getMinutesFromStringTime,
  normalizeTimeForOutput,
} from "./time-slots.utils";

import { useEscape } from "@/hooks/use-escape";
import { classNames } from "@/utils/ui.utils";
import styles from "./time-slots.module.css";

interface TimeSlotsEventProps {
  event: TimeEvent;
  index: number;
}

const defaultGap = 16;

export const TimeSlotsEvent: FC<TimeSlotsEventProps> = ({ event, index }) => {
  const eleRef = useRef<HTMLDivElement>(null);
  const eventTimeRef = useRef<HTMLDivElement>(null);

  const resizeToTimeRef = useRef<string | null>(null);

  const [resizing, setResizing] = useState<"top" | "bottom" | null>(null);

  const { columnWidth, headRect, cols, rootRef, stepInMinutes, onEventResize, onEventClick } =
    useTimeSlots();

  const startInMinutes = getMinutesFromStringTime(event.start);
  const endInMinutes = getMinutesFromStringTime(event.end);

  const eventStyle = useMemo(() => {
    if (startInMinutes === null || endInMinutes === null) return undefined;

    const gap = index * 16;
    const top = headRect.height + (startInMinutes / 60) * TIME_SLOTS_CONFIG.hourCellHeight;
    const right = (cols.length - event.columnIndex - 1) * columnWidth + defaultGap;
    const height = ((endInMinutes - startInMinutes) / 60) * TIME_SLOTS_CONFIG.hourCellHeight - 1;

    return {
      right,
      top,
      width: columnWidth - 16 - gap,
      minWidth: columnWidth * 0.3,
      height,
    };
  }, []);

  const isResizable = useMemo(() => {
    return (
      typeof startInMinutes === "number" && typeof endInMinutes === "number" && !!onEventResize
    );
  }, [startInMinutes, endInMinutes, onEventResize]);

  const onResetResizing = () => {
    resizeToTimeRef.current = null;
    setResizing(null);

    if (!eventTimeRef.current || !eleRef.current) return;

    eleRef.current.style.setProperty("top", `${eventStyle?.top}px`);
    eleRef.current.style.setProperty("height", `${eventStyle?.height}px`);
    eventTimeRef.current.textContent = `${displayMinutes(startInMinutes ?? 0)} - ${displayMinutes(
      endInMinutes ?? 0
    )}`;
  };

  useEffect(() => {
    if (!resizing || !rootRef.current) return;

    const onResizing = () => {
      const cursorTime = rootRef.current?.getAttribute(TIME_SLOTS_CONFIG.cursorTimeAttr);
      if (!cursorTime) {
        onResetResizing();
        return;
      }

      const cursorTimeInMinutes = getMinutesFromStringTime(cursorTime);
      const eventStartTimeInMinutes = getMinutesFromStringTime(event.start);
      const eventEndTimeInMinutes = getMinutesFromStringTime(event.end);

      if (
        cursorTimeInMinutes === null ||
        eventStartTimeInMinutes === null ||
        eventEndTimeInMinutes === null ||
        !eventTimeRef.current
      )
        return;

      if (resizing === "top") {
        const newHeight =
          ((eventEndTimeInMinutes - cursorTimeInMinutes) / 60) * TIME_SLOTS_CONFIG.hourCellHeight -
          1;

        const newTop =
          headRect.height + (cursorTimeInMinutes / 60) * TIME_SLOTS_CONFIG.hourCellHeight;

        eleRef.current?.style.setProperty("height", `${newHeight}px`);
        eleRef.current?.style.setProperty("top", `${newTop}px`);
        eventTimeRef.current.textContent = `${displayMinutes(
          cursorTimeInMinutes
        )} - ${displayMinutes(endInMinutes ?? 0)}`;
      }

      if (resizing === "bottom") {
        const newHeight =
          ((cursorTimeInMinutes + stepInMinutes - eventStartTimeInMinutes) / 60) *
            TIME_SLOTS_CONFIG.hourCellHeight -
          1;

        const newTop =
          headRect.height + (eventStartTimeInMinutes / 60) * TIME_SLOTS_CONFIG.hourCellHeight;

        eleRef.current?.style.setProperty("height", `${newHeight}px`);
        eleRef.current?.style.setProperty("top", `${newTop}px`);
        eventTimeRef.current.textContent = `${displayMinutes(
          eventStartTimeInMinutes
        )} - ${displayMinutes(cursorTimeInMinutes + stepInMinutes)}`;
      }

      resizeToTimeRef.current = cursorTime;
    };

    const observer = new MutationObserver(onResizing);

    observer.observe(rootRef.current, {
      attributes: true,
      attributeFilter: [TIME_SLOTS_CONFIG.cursorTimeAttr],
    });

    const onMouseUp = () => {
      if (!resizeToTimeRef.current || !resizing || !onEventResize) return onResetResizing();

      const resizeToTimeInMinutes = getMinutesFromStringTime(resizeToTimeRef.current);

      if (resizeToTimeInMinutes === null) return onResetResizing();

      const newEvent = {
        ...event,
        start: resizing === "top" ? normalizeTimeForOutput(resizeToTimeInMinutes) : event.start,
        end:
          resizing === "bottom"
            ? normalizeTimeForOutput(resizeToTimeInMinutes + stepInMinutes)
            : event.end,
      };

      onEventResize(newEvent);
      setResizing(null);
    };

    rootRef.current.addEventListener("mouseup", onMouseUp);

    return () => {
      onResetResizing();
      observer.disconnect();
      rootRef.current?.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizing, eventStyle]);

  useEscape({
    id: `resizing-${event.id}`,
    onEscape: onResetResizing,
    active: !!resizing,
  });

  if (startInMinutes === null || endInMinutes === null) return null;

  return (
    <div
      ref={eleRef}
      id={event.id}
      key={event.id}
      className={classNames(styles.Event, {
        [styles.isResizing]: !!resizing,
        [styles.isClickable]: !!onEventClick,
      })}
      style={eventStyle}
      onMouseDown={() => {
        if (!eleRef.current || !onEventClick || !!resizing) return;
        onEventClick(event, eleRef.current);
      }}
      data-event-id={event.id}
    >
      <div
        className={classNames(styles.EventContent, {
          [styles.isWithBorder]: index > 0,
        })}
        style={{
          background: event.background ?? "var(--app-primary-color, #0063ff)",
        }}
      >
        {isResizable && (
          <button
            type="button"
            className={classNames(styles.ResizeHandle, styles.Top)}
            data-resize-position="top"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setResizing("top");
            }}
          />
        )}

        <div className={styles.EventTime} ref={eventTimeRef}>
          {displayMinutes(startInMinutes)} - {displayMinutes(endInMinutes)}
        </div>

        {event.title}

        {isResizable && (
          <button
            type="button"
            className={classNames(styles.ResizeHandle, styles.Bottom)}
            data-resize-position="bottom"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setResizing("bottom");
            }}
          />
        )}
      </div>
    </div>
  );
};
