"use client";

import { Box, Group } from "@mantine/core";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { ganttConfig } from "../gantt-tasks-config";
import { useGanttRefs } from "../gantt-tasks-refs";

export const GanttTasksHorizontalScrollbar: FC = () => {
  const ganttRefs = useGanttRefs();
  const scrollbarTrackRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  // Calculate scrollbar dimensions and position
  const updateScrollbar = useCallback(() => {
    const bodyContainer = ganttRefs.bodyContainer.current;
    const scrollbarTrack = scrollbarTrackRef.current;

    if (!bodyContainer || !scrollbarTrack) return;

    const scrollWidth = bodyContainer.scrollWidth;
    const clientWidth = bodyContainer.clientWidth;
    const scrollLeft = bodyContainer.scrollLeft;
    const trackWidth = scrollbarTrack.clientWidth;

    // Calculate thumb width (proportional to visible area)
    const thumbWidthRatio = clientWidth / scrollWidth;
    const newThumbWidth = Math.max(20, trackWidth * thumbWidthRatio); // Minimum 20px
    setThumbWidth(newThumbWidth);

    // Calculate thumb position (proportional to scroll position)
    const maxScrollLeft = scrollWidth - clientWidth;
    const scrollRatio = maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0;
    const maxThumbLeft = trackWidth - newThumbWidth;
    const newThumbLeft = scrollRatio * maxThumbLeft;
    setThumbLeft(newThumbLeft);
  }, [ganttRefs.bodyContainer]);

  // Handle scroll events from body container
  useEffect(() => {
    const bodyContainer = ganttRefs.bodyContainer.current;
    const body = ganttRefs.body.current;
    if (!bodyContainer) return;

    updateScrollbar();

    const handleScroll = () => {
      if (!isDragging) {
        updateScrollbar();
      }
    };

    bodyContainer.addEventListener("scroll", handleScroll, { passive: true });

    // Update on resize of container
    const resizeObserver = new ResizeObserver(() => {
      updateScrollbar();
    });
    resizeObserver.observe(bodyContainer);

    // Update when body content changes (tasks added/removed, time range extends)
    const mutationObserver = new MutationObserver(() => {
      updateScrollbar();
    });
    if (body) {
      mutationObserver.observe(body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    return () => {
      bodyContainer.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ganttRefs.bodyContainer, ganttRefs.body, updateScrollbar, isDragging]);

  // Handle mouse down on thumb
  const handleThumbMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const bodyContainer = ganttRefs.bodyContainer.current;
      if (!bodyContainer) return;

      setIsDragging(true);
      dragStartXRef.current = e.clientX;
      dragStartScrollLeftRef.current = bodyContainer.scrollLeft;

      const handleMouseMove = (e: MouseEvent) => {
        const bodyContainer = ganttRefs.bodyContainer.current;
        const scrollbarTrack = scrollbarTrackRef.current;
        if (!bodyContainer || !scrollbarTrack) return;

        const deltaX = e.clientX - dragStartXRef.current;
        const trackWidth = scrollbarTrack.clientWidth;
        const scrollWidth = bodyContainer.scrollWidth;
        const clientWidth = bodyContainer.clientWidth;
        const maxScrollLeft = scrollWidth - clientWidth;

        // Calculate scroll delta based on track movement
        const scrollDelta = (deltaX / trackWidth) * scrollWidth;
        const newScrollLeft = Math.max(
          0,
          Math.min(maxScrollLeft, dragStartScrollLeftRef.current + scrollDelta)
        );

        bodyContainer.scrollLeft = newScrollLeft;
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
    [ganttRefs.bodyContainer, updateScrollbar]
  );

  // Handle click on track (jump to position)
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      const bodyContainer = ganttRefs.bodyContainer.current;
      const scrollbarTrack = scrollbarTrackRef.current;
      if (!bodyContainer || !scrollbarTrack) return;

      // Don't jump if clicking on thumb
      if (scrollbarThumbRef.current?.contains(e.target as Node)) {
        return;
      }

      const trackRect = scrollbarTrack.getBoundingClientRect();
      const clickX = e.clientX - trackRect.left;
      const trackWidth = scrollbarTrack.clientWidth;
      const scrollWidth = bodyContainer.scrollWidth;
      const clientWidth = bodyContainer.clientWidth;
      const maxScrollLeft = scrollWidth - clientWidth;

      // Calculate target scroll position
      const clickRatio = clickX / trackWidth;
      const targetScrollLeft = clickRatio * maxScrollLeft;

      bodyContainer.scrollLeft = Math.max(0, Math.min(maxScrollLeft, targetScrollLeft));
    },
    [ganttRefs.bodyContainer]
  );

  // Only show scrollbar if content overflows
  const shouldShowScrollbar = thumbWidth < (scrollbarTrackRef.current?.clientWidth ?? 0);

  return (
    <Group
      w="100%"
      h={ganttConfig.scrollbarSize.horizontal}
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
            h="60%"
            style={{
              position: "absolute",
              left: `${thumbLeft}px`,
              width: `${thumbWidth}px`,
              backgroundColor: isDragging
                ? "var(--mantine-color-gray-filled)"
                : "var(--mantine-color-disabled-color)",
              borderRadius: "4px",
              cursor: isDragging ? "grabbing" : "grab",
              transition: isDragging ? "none" : "background-color 0.2s",
              top: "50%",
              transform: "translateY(-50%)",
            }}
            onMouseDown={handleThumbMouseDown}
          />
        )}
      </Box>
    </Group>
  );
};
