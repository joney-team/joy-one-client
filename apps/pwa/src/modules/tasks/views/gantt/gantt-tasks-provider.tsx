"use client";

import { wait } from "@/utils/common.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { useLingui } from "@lingui/react/macro";
import { useThrottledCallback } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setTaskMenuRoot } from "../../modules/task-menu/task-menu";
import { parseTaskPath } from "../../tasks-route-helpers";
import { ganttConfig } from "./gantt-tasks-config";
import { Context } from "./gantt-tasks-context";
import { useGanttRefs } from "./gantt-tasks-refs";
import type { GanttState, ScrollDirection, ScrollToDate, UseGantt } from "./gantt-tasks-types";
import { getDateRangeBreakdown } from "./gantt-tasks-utils";

let scrollTop = -1;
const oneDate = 24 * 60 * 60 * 1000;

export const GanttProvider: FC<PropsWithChildren> = (props) => {
  const { i18n } = useLingui();
  const refs = useGanttRefs();
  const pathname = usePathname();
  const [version, setVersion] = useState(0);
  const rerender = () => setVersion((s) => s + 1);

  const [isInitialized, setIsInitialized] = useState(false);
  const isGrabbingRef = useRef(false);

  const { code: taskCode } = useMemo(() => parseTaskPath(pathname), [pathname]);

  const [ganttState, setGanttState] = useState<GanttState>({
    unit: "day",
    fromDate: new Date(),
    toDate: new Date(),
  });

  const range = useMemo(
    () =>
      getDateRangeBreakdown(ganttState.fromDate, ganttState.toDate, i18n.locale === "vi" ? 1 : 0),
    [ganttState.fromDate, ganttState.toDate, i18n.locale]
  );

  const columns = useMemo(() => {
    if (ganttState.unit === "day" || ganttState.unit === "date") {
      return range.dates.map((date) => ({
        start: DateTime.getRange(date, "day").start,
        end: DateTime.getRange(date, "day").end,
      }));
    }

    if (ganttState.unit === "week") {
      return range.weeks.map((week) => ({
        start: week.start,
        end: week.end,
      }));
    }

    if (ganttState.unit === "month") {
      return range.months.map((month) => ({
        start: month.start,
        end: month.end,
      }));
    }

    return [];
  }, [ganttState.unit, range]);

  const columnResizing = useRef(false);

  const onExtendTimeRange = useThrottledCallback(async () => {
    if (columnResizing.current) return;

    const bodyContainer = refs.bodyContainer.current;
    columnResizing.current = true;

    const offset = 100;

    // Detect scroll to the end of left or right
    const isEndLeft = bodyContainer.scrollLeft <= 0 + offset;
    const isEndRight =
      bodyContainer.scrollLeft >= bodyContainer.scrollWidth - bodyContainer.clientWidth - offset;
    const currentScrollLeft = bodyContainer.scrollLeft;

    if (isEndLeft || isEndRight) {
      if (isEndLeft) {
        setGanttState((s) => {
          return {
            ...s,
            fromDate: new Date(s.fromDate.getTime() - oneDate * ganttConfig.rangeDates),
          };
        });

        await wait(100);
        const distance = ganttConfig.rangeDates * ganttConfig.columnSize;
        refs.bodyContainer.current.scrollTo({
          left: distance + currentScrollLeft,
          behavior: "instant",
        });
      }

      if (isEndRight) {
        setGanttState((s) => {
          return {
            ...s,
            toDate: new Date(s.toDate.getTime() + oneDate * ganttConfig.rangeDates),
          };
        });
      }

      await wait(500);
    }

    columnResizing.current = false;
  }, 500);

  const initialize = () => {
    const now = Date.now();
    const fromDate = now - oneDate * ganttConfig.rangeDates;
    const toDate = now + oneDate * ganttConfig.rangeDates * 2;

    setGanttState((s) => ({
      ...s,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    }));

    setIsInitialized(true);
  };

  const changeColumnSize = (size: number) => {
    setGanttState((s) => ({ ...s, columnSize: size }));
  };

  const scrollToDate: ScrollToDate = useCallback(
    (args) => {
      if (!refs.bodyContainer.current) return;

      const date = typeof args === "number" ? args : (args as { date: Date | number }).date;

      const offset =
        typeof args === "number"
          ? -ganttConfig.columnSize * 0.8
          : (args as { offset?: number }).offset || -ganttConfig.columnSize * 0.8;

      const behavior =
        typeof args === "number"
          ? "smooth"
          : "behavior" in args
          ? (args as { behavior?: "smooth" | "instant" }).behavior
          : "smooth";

      const scrollDate = DateTime.normalizeDate(date);

      const columnIndex = columns.findIndex(
        (column) => column.start <= scrollDate && column.end >= scrollDate
      );

      const scrollLeft = columnIndex * ganttConfig.columnSize;

      if (columnIndex >= 0) {
        refs.bodyContainer.current.scrollTo({
          left: scrollLeft + offset,
          behavior,
        });
      }
    },
    [columns, isInitialized, ganttState]
  );

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      setTaskMenuRoot(refs.bodyContainer.current);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      const sidebarContainer = refs.sidebarContainer.current!;
      const bodyContainer = refs.bodyContainer.current!;

      if (isInitialized && sidebarContainer && bodyContainer) {
        const onScroll = (ev: Event) => {
          ev.preventDefault();

          const scrollDirection: ScrollDirection =
            scrollTop !== (ev.target as HTMLElement).scrollTop ? "vertical" : "horizontal";

          scrollTop = (ev.target as HTMLElement).scrollTop;

          // Extend time range when scrolling horizontally on body
          if (scrollDirection === "horizontal") {
            onExtendTimeRange();
          }
        };

        bodyContainer?.addEventListener("scroll", onScroll);

        return () => {
          bodyContainer?.removeEventListener("scroll", onScroll);
        };
      }
    }
  }, [isInitialized]);

  const syncBodySize = () => {
    const height = (refs.sidebarContainer.current?.scrollHeight ?? 0) - ganttConfig.headHeight;
    refs.body.current?.style.setProperty("min-height", `${height}px`);
    refs.body.current?.style.setProperty("max-height", `${height}px`);

    const width = refs.bodyContainer.current?.scrollWidth ?? 0;
    refs.body.current?.style.setProperty("min-width", `${width}px`);
    refs.body.current?.style.setProperty("max-width", `${width}px`);
  };

  useEffect(() => {
    syncBodySize();
  }, [range]);

  useEffect(() => {
    if (!isInitialized) return;

    const sidebarContainerMutationObserver = new MutationObserver(syncBodySize);
    sidebarContainerMutationObserver.observe(refs.sidebarContainer.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      sidebarContainerMutationObserver.disconnect();
    };
  }, [isInitialized]);

  useEffect(() => {
    if (!isInitialized || Boolean(taskCode)) return;

    const bodyContainer = refs.bodyContainer.current;
    const sidebarContainer = refs.sidebarContainer.current;

    if (!bodyContainer || !sidebarContainer) return;

    // --- STATE ---
    let pendingDeltaX = 0;
    let pendingDeltaY = 0;
    let ticking = false;

    // --- WHEEL EVENT HANDLER ---
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      ev.stopPropagation();

      pendingDeltaX += ev.deltaX;
      pendingDeltaY += ev.deltaY;

      if (!ticking) {
        ticking = true;

        requestAnimationFrame(() => {
          if (pendingDeltaX !== 0) {
            bodyContainer.scrollLeft += pendingDeltaX;
          }

          if (pendingDeltaY !== 0) {
            bodyContainer.scrollTop += pendingDeltaY;
            sidebarContainer.scrollTop += pendingDeltaY;
          }

          pendingDeltaX = 0;
          pendingDeltaY = 0;
          ticking = false;
        });
      }
    };

    // --- ADD LISTENER ---
    bodyContainer.addEventListener("wheel", onWheel, { passive: false });
    sidebarContainer.addEventListener("wheel", onWheel, { passive: false });

    const onWindowWheel = (ev: WheelEvent) => {
      ev.preventDefault();
    };

    window.addEventListener("wheel", onWindowWheel, { passive: false });
    document.body.style.setProperty("overscroll-behavior-x", "none");

    // --- CLEANUP ---
    return () => {
      bodyContainer.removeEventListener("wheel", onWheel);
      sidebarContainer.removeEventListener("wheel", onWheel);
      window.removeEventListener("wheel", onWindowWheel);
      document.body.style.removeProperty("overscroll-behavior-x");
    };
  }, [isInitialized, taskCode]);

  useEffect(() => {
    if (!isInitialized || !refs.root.current) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (isGrabbingRef.current) return;

      if (e.code === "Space") {
        isGrabbingRef.current = true;
        rerender();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (!isGrabbingRef.current) return;

      if (e.code === "Space") {
        isGrabbingRef.current = false;
        rerender();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isInitialized]);

  useEffect(() => {
    if (isGrabbingRef.current) {
      const bodyContainer = refs.bodyContainer.current;
      const sidebarContainer = refs.sidebarContainer.current;
      if (!bodyContainer || !sidebarContainer) return;

      let isGrabbingEventEnabled = false;

      let startX = 0;
      let startY = 0;
      let scrollLeft = 0;
      let scrollTop = 0;

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isGrabbingEventEnabled = true;
        refs.root.current?.setAttribute("gantt-event", "grabbing");

        startX = e.pageX - bodyContainer.offsetLeft;
        startY = e.pageY - bodyContainer.offsetTop;

        scrollLeft = bodyContainer.scrollLeft;
        scrollTop = bodyContainer.scrollTop;
      };

      const onMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isGrabbingEventEnabled = false;
        refs.root.current?.removeAttribute("gantt-event");
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isGrabbingEventEnabled) return;

        e.preventDefault();

        const x = e.pageX - bodyContainer.offsetLeft;
        const walkX = x - startX;
        const y = e.pageY - bodyContainer.offsetTop;
        const walkY = y - startY;

        bodyContainer.scrollLeft = scrollLeft - walkX;
        bodyContainer.scrollTop = scrollTop - walkY;

        sidebarContainer.scrollTop = scrollTop - walkY;
        sidebarContainer.scrollLeft = scrollLeft - walkX;
      };

      window.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mouseup", onMouseUp);
      bodyContainer.addEventListener("mousemove", onMouseMove);

      return () => {
        window.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mouseup", onMouseUp);
        bodyContainer.removeEventListener("mousemove", onMouseMove);
      };
    }
  }, [isGrabbingRef.current, version]);

  const contextValue: UseGantt = {
    columns,
    state: ganttState,
    setState: setGanttState,
    range,
    changeColumnSize,
    scrollToDate,
    isGrabbing: isGrabbingRef.current,
  };

  return (
    <Context.Provider value={contextValue}>
      {isInitialized ? props.children : null}
    </Context.Provider>
  );
};
