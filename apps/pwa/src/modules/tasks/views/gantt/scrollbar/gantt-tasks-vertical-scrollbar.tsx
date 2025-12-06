"use client";

import { Box, Stack } from "@mantine/core";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { ganttConfig } from "../gantt-tasks-config";
import { useGanttRefs } from "../gantt-tasks-refs";

export const GanttTasksVerticalScrollbar: FC = () => {
  const ganttRefs = useGanttRefs();
  const scrollbarTrackRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);

  // Calculate scrollbar dimensions and position
  const updateScrollbar = useCallback(() => {
    const sidebarContainer = ganttRefs.sidebarContainer.current;
    const scrollbarTrack = scrollbarTrackRef.current;

    if (!sidebarContainer || !scrollbarTrack) return;

    const scrollHeight = sidebarContainer.scrollHeight;
    const clientHeight = sidebarContainer.clientHeight;
    const scrollTop = sidebarContainer.scrollTop;
    const trackHeight = scrollbarTrack.clientHeight;

    // Calculate thumb height (proportional to visible area)
    const thumbHeightRatio = clientHeight / scrollHeight;
    const newThumbHeight = Math.max(20, trackHeight * thumbHeightRatio); // Minimum 20px
    setThumbHeight(newThumbHeight);

    // Calculate thumb position (proportional to scroll position)
    const maxScrollTop = scrollHeight - clientHeight;
    const scrollRatio = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
    const maxThumbTop = trackHeight - newThumbHeight;
    const newThumbTop = scrollRatio * maxThumbTop;
    setThumbTop(newThumbTop);
  }, [ganttRefs.sidebarContainer]);

  // Handle scroll events from sidebar container
  useEffect(() => {
    const sidebarContainer = ganttRefs.sidebarContainer.current;
    const bodyContainer = ganttRefs.bodyContainer.current;
    if (!sidebarContainer) return;

    updateScrollbar();

    const handleScroll = () => {
      if (!isDragging) {
        updateScrollbar();
        // Sync body container with sidebar when scrolling
        if (bodyContainer && bodyContainer.scrollTop !== sidebarContainer.scrollTop) {
          bodyContainer.scrollTop = sidebarContainer.scrollTop;
        }
      }
    };

    sidebarContainer.addEventListener("scroll", handleScroll, { passive: true });

    // Update on resize of container
    const resizeObserver = new ResizeObserver(() => {
      updateScrollbar();
    });
    resizeObserver.observe(sidebarContainer);

    // Update when sidebar content changes (tasks added/removed)
    const mutationObserver = new MutationObserver(() => {
      updateScrollbar();
    });
    mutationObserver.observe(sidebarContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      sidebarContainer.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ganttRefs.sidebarContainer, ganttRefs.bodyContainer, updateScrollbar, isDragging]);

  // Handle mouse down on thumb
  const handleThumbMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const sidebarContainer = ganttRefs.sidebarContainer.current;
      const bodyContainer = ganttRefs.bodyContainer.current;
      if (!sidebarContainer) return;

      setIsDragging(true);
      dragStartYRef.current = e.clientY;
      dragStartScrollTopRef.current = sidebarContainer.scrollTop;

      const handleMouseMove = (e: MouseEvent) => {
        const sidebarContainer = ganttRefs.sidebarContainer.current;
        const scrollbarTrack = scrollbarTrackRef.current;
        if (!sidebarContainer || !scrollbarTrack) return;

        const deltaY = e.clientY - dragStartYRef.current;
        const trackHeight = scrollbarTrack.clientHeight;
        const scrollHeight = sidebarContainer.scrollHeight;
        const clientHeight = sidebarContainer.clientHeight;
        const maxScrollTop = scrollHeight - clientHeight;

        // Calculate scroll delta based on track movement
        const scrollDelta = (deltaY / trackHeight) * scrollHeight;
        const newScrollTop = Math.max(
          0,
          Math.min(maxScrollTop, dragStartScrollTopRef.current + scrollDelta)
        );

        sidebarContainer.scrollTop = newScrollTop;
        // Also sync body container
        if (bodyContainer) {
          bodyContainer.scrollTop = newScrollTop;
        }
        // Update scrollbar immediately during drag
        updateScrollbar();
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [ganttRefs.sidebarContainer, ganttRefs.bodyContainer, updateScrollbar]
  );

  // Handle click on track (jump to position)
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      const sidebarContainer = ganttRefs.sidebarContainer.current;
      const bodyContainer = ganttRefs.bodyContainer.current;
      const scrollbarTrack = scrollbarTrackRef.current;
      if (!sidebarContainer || !scrollbarTrack) return;

      // Don't jump if clicking on thumb
      if (scrollbarThumbRef.current?.contains(e.target as Node)) {
        return;
      }

      const trackRect = scrollbarTrack.getBoundingClientRect();
      const clickY = e.clientY - trackRect.top;
      const trackHeight = scrollbarTrack.clientHeight;
      const scrollHeight = sidebarContainer.scrollHeight;
      const clientHeight = sidebarContainer.clientHeight;
      const maxScrollTop = scrollHeight - clientHeight;

      // Calculate target scroll position
      const clickRatio = clickY / trackHeight;
      const targetScrollTop = clickRatio * maxScrollTop;

      const newScrollTop = Math.max(0, Math.min(maxScrollTop, targetScrollTop));
      sidebarContainer.scrollTop = newScrollTop;
      // Also sync body container
      if (bodyContainer) {
        bodyContainer.scrollTop = newScrollTop;
      }
    },
    [ganttRefs.sidebarContainer, ganttRefs.bodyContainer]
  );

  // Only show scrollbar if content overflows
  const shouldShowScrollbar = thumbHeight < (scrollbarTrackRef.current?.clientHeight ?? 0);

  return (
    <Stack
      w={ganttConfig.scrollbarSize.vertical}
      h="100%"
      style={{
        position: "relative",
        cursor: isDragging ? "grabbing" : "default",
        userSelect: "none",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        ref={scrollbarTrackRef}
        w="100%"
        h="100%"
        style={{
          position: "relative",
          backgroundColor: "var(--mantine-color-disabled)",
          borderRadius: "4px",
          cursor: shouldShowScrollbar ? "pointer" : "default",
        }}
        onClick={handleTrackClick}
      >
        {shouldShowScrollbar && (
          <Box
            ref={scrollbarThumbRef}
            w="60%"
            style={{
              position: "absolute",
              top: `${thumbTop}px`,
              height: `${thumbHeight}px`,
              backgroundColor: isDragging
                ? "var(--mantine-color-gray-filled)"
                : "var(--mantine-color-disabled-color)",
              borderRadius: "4px",
              cursor: isDragging ? "grabbing" : "grab",
              transition: isDragging ? "none" : "background-color 0.2s",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            onMouseDown={handleThumbMouseDown}
          />
        )}
      </Box>
    </Stack>
  );
};
