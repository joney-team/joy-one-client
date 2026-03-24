import { useEffect, useState } from "react";
import { TIME_SLOTS_CONFIG, useTimeSlots } from "./time-slots.constants";
import { TimeEvent, TimeInterval } from "./time-slots.types";

export function getMousePosInElement(e: MouseEvent, el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  return { x, y };
}

export const useTimeSlotsAttributes = () => {
  const { rootRef, ...rest } = useTimeSlots();
  const [attributes, setAttributes] = useState<{
    cursorColumnIndex?: number;
    cursorTime?: string;
    selectTimeFrom?: string;
    selectColumnIndex?: number;
  }>({});

  useEffect(() => {
    if (rootRef.current) {
      const syncAttributes = () => {
        if (!rootRef.current) return;

        const cursorColumnIndex = rootRef.current.getAttribute(
          TIME_SLOTS_CONFIG.cursorColumnIndexAttr,
        );

        const selectColumnIndex = rootRef.current.getAttribute(
          TIME_SLOTS_CONFIG.selectColumnIndexAttr,
        );

        setAttributes({
          cursorColumnIndex: cursorColumnIndex ? Number(cursorColumnIndex) : undefined,
          cursorTime: rootRef.current.getAttribute(TIME_SLOTS_CONFIG.cursorTimeAttr) ?? undefined,
          selectTimeFrom:
            rootRef.current.getAttribute(TIME_SLOTS_CONFIG.selectTimeFromAttr) ?? undefined,
          selectColumnIndex: selectColumnIndex ? Number(selectColumnIndex) : undefined,
        });
      };

      syncAttributes();

      const observer = new MutationObserver(syncAttributes);

      observer.observe(rootRef.current, {
        attributes: true,
        attributeFilter: [
          TIME_SLOTS_CONFIG.cursorTimeAttr,
          TIME_SLOTS_CONFIG.cursorColumnIndexAttr,
          TIME_SLOTS_CONFIG.selectTimeFromAttr,
          TIME_SLOTS_CONFIG.selectColumnIndexAttr,
        ],
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [rootRef.current]);

  return {
    ...attributes,
    ...rest,
    rootRef,
  };
};

export const getMinutesFromStringTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  if (!time || time.length === 0 || Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return +hour * 60 + +minute;
};

export function displayHour(hour: number, minutes?: number) {
  const period = hour >= 12 ? "pm" : "am";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  if (!minutes || minutes === 0) return `${hour12} ${period}`;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function displayMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return displayHour(hours, remainingMinutes);
}

export function strictAvailableTimes(
  availableTimes: { start: number; end: number }[],
  user: { start: number; end: number },
): { start: number; end: number } | null {
  // sort available
  const sorted = [...availableTimes].sort((a, b) => a.start - b.start);

  // find overlap
  for (const a of sorted) {
    const start = Math.max(user.start, a.start);
    const end = Math.min(user.end, a.end);

    if (start < end) {
      return { start, end };
    }
  }

  // if no overlap -> snap to nearest available
  let nearest = sorted[0];
  let minDist = Infinity;

  for (const a of sorted) {
    const dist = Math.min(Math.abs(user.start - a.start), Math.abs(user.end - a.end));
    if (dist < minDist) {
      minDist = dist;
      nearest = a;
    }
  }

  // fallback: clamp into nearest slot
  return {
    start: Math.max(user.start, nearest.start),
    end: Math.min(user.end, nearest.end),
  };
}

export function getSelectedTimeRange(args: {
  from: string | null | undefined;
  to: string | null | undefined;
  stepInMinutes: number;
  availableTimeIntervals?: TimeInterval[];
}): { start: number; end: number } | null {
  if (!args.from || !args.to) return null;

  const fromMinutes = getMinutesFromStringTime(args.from);
  const toMinutes = getMinutesFromStringTime(args.to);

  if (fromMinutes === null || toMinutes === null) return null;

  const availableTimeIntervals = (args.availableTimeIntervals ?? []).map((interval) => ({
    start: getMinutesFromStringTime(interval.start)!,
    end: getMinutesFromStringTime(interval.end)!,
  }));

  const timeRange =
    toMinutes - fromMinutes < 0 && fromMinutes - toMinutes < args.stepInMinutes
      ? {
          start: fromMinutes,
          end: toMinutes + args.stepInMinutes,
        }
      : toMinutes < fromMinutes
        ? {
            start: toMinutes,
            end: fromMinutes,
          }
        : {
            start: fromMinutes,
            end: toMinutes + args.stepInMinutes,
          };

  if (availableTimeIntervals.length > 0) {
    return strictAvailableTimes(availableTimeIntervals, timeRange);
  }

  return timeRange;
}

export function normalizeTimeForOutput(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}`;
}

export function groupOverlappingEvents(events: TimeEvent[]): TimeEvent[][] {
  if (!events.length) return [];

  // sort by start time
  const sorted = [...events].sort(
    (a, b) => (getMinutesFromStringTime(a.start) ?? 0) - (getMinutesFromStringTime(b.start) ?? 0),
  );

  const groups: TimeEvent[][] = [];
  let currentGroup: TimeEvent[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = currentGroup[currentGroup.length - 1];
    const curr = sorted[i];

    const prevEnd = getMinutesFromStringTime(prev.end) ?? 0;
    const currStart = getMinutesFromStringTime(curr.start) ?? 0;

    // overlap
    if (currStart < prevEnd) {
      currentGroup.push(curr);
    } else {
      groups.push(currentGroup);
      currentGroup = [curr];
    }
  }

  groups.push(currentGroup);
  return groups;
}

export function getParentScrollContainer(root: HTMLElement): HTMLElement | null {
  const maxDepth = 3;
  let output = null;
  let pointedElement: HTMLElement | null = root.parentElement;

  for (let i = 0; i < maxDepth; i++) {
    if (!pointedElement) break;
    const style = getComputedStyle(pointedElement);

    if (
      style.overflow === "auto" ||
      style.overflow === "scroll" ||
      style.overflowY === "auto" ||
      style.overflowY === "scroll" ||
      style.overflowX === "auto" ||
      style.overflowX === "scroll"
    ) {
      output = pointedElement;
      break;
    } else {
      pointedElement = pointedElement.parentElement;
    }
  }

  return output;
}
