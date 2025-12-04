"use client";

import { useLayout } from "@/layout/layout-context";
import { wait } from "@/utils/common.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { useLingui } from "@lingui/react/macro";
import { useForceUpdate, useThrottledCallback } from "@mantine/hooks";
import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ganttConfig } from "./gantt-tasks-config";
import { Context } from "./gantt-tasks-context";
import { useGanttRefs } from "./gantt-tasks-refs";
import type {
  GanttLayout,
  GanttState,
  ScrollDirection,
  ScrollToDateArgs,
  UseGantt,
} from "./gantt-tasks-types";
import { getDateRangeBreakdown } from "./gantt-tasks-utils";

let scrollTop = -1;
const oneDate = 24 * 60 * 60 * 1000;

export const GanttProvider: FC<PropsWithChildren> = (props) => {
  const { i18n } = useLingui();
  const layout = useLayout();
  const refs = useGanttRefs();

  const [isInitialized, setIsInitialized] = useState(false);

  const [ganttState, setGanttState] = useState<GanttState>({
    unit: "day",
    fromDate: new Date(),
    toDate: new Date(),
    columnSize: ganttConfig.minColumnSize,
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

  const forceUpdate = useForceUpdate();

  const activeLayout = useRef<GanttLayout | null>(null);

  const columnResizing = useRef(false);

  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [sidebarContentWidth, setSidebarContentWidth] = useState(200);
  const [sidebarContentScrollPosition, setSidebarContentScrollPosition] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection | null>(null);

  const setActiveLayout = (layout?: GanttLayout) => {
    activeLayout.current = layout || null;
    forceUpdate();
  };

  const onExtendTimeRange = useThrottledCallback(async () => {
    if (columnResizing.current) return;

    const contentBody = refs.bodyContainer.current!;
    columnResizing.current = true;

    const offset = 100;

    // Detect scroll to the end of left or right
    const isEndLeft = contentBody.scrollLeft <= 0 + offset;
    const isEndRight =
      contentBody.scrollLeft >= contentBody.scrollWidth - contentBody.clientWidth - offset;

    if (isEndLeft || isEndRight) {
      if (isEndLeft) {
        setGanttState((s) => {
          return {
            ...s,
            fromDate: new Date(s.fromDate.getTime() - oneDate * ganttConfig.rangeDates),
          };
        });

        await wait(100);
        const distance = ganttConfig.rangeDates * ganttState.columnSize;
        contentBody.scrollLeft = distance;
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

  const toggleSisplayTaskStatusColor = () => {
    setGanttState((s) => ({ ...s, displayTaskStatusColor: !s.displayTaskStatusColor }));
  };

  const changeColumnSize = (size: number) => {
    setGanttState((s) => ({ ...s, columnSize: size }));
  };

  const scrollToDate: ScrollToDateArgs = useCallback(
    (args) => {
      const date = typeof args === "number" ? args : (args as { date: Date | number }).date;
      const offset =
        typeof args === "number"
          ? -ganttState.columnSize * 0.8
          : (args as { offset?: number }).offset || -ganttState.columnSize * 0.8;

      const behavior =
        typeof args === "number"
          ? "instant"
          : (args as { behavior?: "smooth" | "instant" }).behavior || "smooth";

      const scrollDate = DateTime.normalizeDate(date);

      const columnIndex = columns.findIndex(
        (column) => column.start <= scrollDate && column.end >= scrollDate
      );

      const scrollLeft = columnIndex * ganttState.columnSize;

      if (columnIndex >= 0) {
        refs.bodyContainer.current.scrollTo({
          left: scrollLeft + offset,
          behavior,
        });
      }
    },
    [columns, ganttState.columnSize]
  );

  useEffect(() => {
    initialize();
  }, []);

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
            // onExtendTimeRange();
          }

          setScrollDirection(scrollDirection);
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
    if (!isInitialized) return;

    const body = refs.bodyContainer.current;
    const sidebar = refs.sidebarContainer.current;

    if (!body || !sidebar) return;

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
            body.scrollLeft += pendingDeltaX;
          }

          if (pendingDeltaY !== 0) {
            body.scrollTop += pendingDeltaY;
            sidebar.scrollTop += pendingDeltaY;
          }

          pendingDeltaX = 0;
          pendingDeltaY = 0;
          ticking = false;
        });
      }
    };

    // --- ADD LISTENER ---
    body.addEventListener("wheel", onWheel, { passive: false });
    sidebar.addEventListener("wheel", onWheel, { passive: false });

    // --- CLEANUP ---
    return () => {
      body.removeEventListener("wheel", onWheel);
      sidebar.removeEventListener("wheel", onWheel);
    };
  }, [isInitialized]);

  const contextValue: UseGantt = {
    columns,
    state: ganttState,
    setState: (s: GanttState) => setGanttState(s),
    dividerPosition:
      typeof ganttState.dividerPosition === "number"
        ? ganttState.dividerPosition
        : layout.view === "mobile"
        ? 0.5
        : 0.3,
    activeLayout: activeLayout.current,
    setActiveLayout,
    range,
    sidebarContentScrollPosition,
    setSidebarContentScrollPosition,
    sidebarContentWidth,
    setSidebarContentWidth,
    sidebarWidth,
    setSidebarWidth,
    changeColumnSize,
    scrollToDate,
    toggleSisplayTaskStatusColor,
    scrollDirection,
    isScrolling: scrollDirection !== null,
  };

  return (
    <Context.Provider value={contextValue}>
      {isInitialized ? props.children : null}
    </Context.Provider>
  );
};
